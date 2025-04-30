/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CancelToken from 'gmp/cancel';
import Rejection from 'gmp/http/rejection';
import Response, {Meta} from 'gmp/http/response';
import {
  Method as HttpMethod,
  Transform,
  TransformOptions,
} from 'gmp/http/transform/transform';
import {
  buildUrlParams,
  UrlParams as Params,
  UrlParamValue as ParamValue,
} from 'gmp/http/utils';
import _ from 'gmp/locale';
import logger from 'gmp/log';
import {isDefined, hasValue, isArray} from 'gmp/utils/identity';

const log = logger.getLogger('gmp.http');

type Data = Record<string, ParamValue | string[] | number[] | boolean[]>;
export type ErrorHandler = (request: XMLHttpRequest) => void;
type Resolve<TData, TMeta extends Meta> = (
  value: Response<TData, TMeta>,
) => void;
type Reject = (reason?: string | Error) => void;

interface HandleOptions {
  method?: HttpMethod;
  url?: string;
  formdata?: FormData;
  force?: boolean;
}

interface TransformArguments<
  TSuccessDataIn,
  TSuccessMetaIn extends Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> extends TransformOptions {
  transform?: Transform<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  >;
}

export interface HttpOptions<
  TSuccessDataIn,
  TSuccessMetaIn extends Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> {
  timeout?: number;
  transform: Transform<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  >;
}

interface RequestOptions<
  TSuccessDataIn,
  TSuccessMetaIn extends Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> {
  args?: Params;
  data?: Data;
  url?: string;
  cancelToken?: CancelToken;
  force?: boolean;
  responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  transform?: Transform<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  >;
  [key: string]: unknown;
}

function formdataAppend(
  formdata: FormData,
  key: string,
  value: ParamValue | null,
) {
  if (hasValue(value)) {
    formdata.append(key, String(value));
  }
}

class Http<
  TSuccessDataIn,
  TSuccessMetaIn extends Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> {
  url: string;
  timeout?: number;
  params: Params;
  errorHandlers: Array<ErrorHandler>;
  transform: Transform<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  >;

  constructor(
    url: string,
    options: HttpOptions<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    >,
  ) {
    const {timeout, transform} = options;

    this.url = url;
    this.params = {};
    this.timeout = timeout;

    this.errorHandlers = [];

    this.transform = transform;

    log.debug('Using http options', options);
  }

  _createFormData(data: Data) {
    const formdata = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // don't add undefined and null values to form
        const value = data[key];
        if (isArray(value)) {
          for (const val of value) {
            formdataAppend(formdata, key, val);
          }
        } else {
          formdataAppend(formdata, key, value);
        }
      }
    }

    return formdata;
  }

  getParams() {
    return this.params;
  }

  request(
    method: HttpMethod,
    {
      args,
      data,
      url = this.url,
      cancelToken,
      force = false,
      responseType,
      ...other
    }: RequestOptions<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    > = {},
  ): Promise<Response<TSuccessDataOut, TSuccessMetaOut>> {
    const self = this;
    let formdata: FormData | undefined;

    method = method.toUpperCase() as HttpMethod;

    if (args) {
      url += '?' + buildUrlParams({...this.getParams(), ...args});
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      formdata = this._createFormData({...this.getParams(), ...data});
    }

    let xhr: XMLHttpRequest;
    const options = {
      method,
      url,
      formdata,
      force,
      ...other,
    };

    const promise = new Promise<Response<TSuccessDataOut, TSuccessMetaOut>>(
      function (resolve, reject) {
        xhr = new XMLHttpRequest();

        xhr.onloadstart = function () {
          // defer setting the responseType to avoid InvalidStateError with IE 11
          if (isDefined(responseType)) {
            xhr.responseType = responseType;
          }
        };

        xhr.open(method, url, true);

        if (isDefined(self.timeout)) {
          xhr.timeout = self.timeout;
        }
        xhr.withCredentials = true; // allow to set Cookies

        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            self.handleSuccess(resolve, reject, this, options);
          } else {
            self.handleResponseError(resolve, reject, this, options);
          }
        };

        xhr.onerror = function () {
          self.handleRequestError(resolve, reject, this, options);
        };

        xhr.ontimeout = function () {
          self.handleTimeout(resolve, reject, this, options);
        };

        xhr.onabort = function () {
          log.debug('Canceled http request', method, url);
        };

        if (isDefined(cancelToken)) {
          cancelToken.promise
            .then(reason => {
              xhr.abort();
              reject(new Rejection(xhr, Rejection.REASON_CANCEL, reason));
            })
            .catch(error => {
              log.error('Error handling cancel token promise', error);
            });
        }

        xhr.send(formdata);
      },
    );

    return promise;
  }

  handleSuccess(
    resolve: Resolve<TSuccessDataOut, TSuccessMetaOut>,
    reject: Reject,
    xhr: XMLHttpRequest,
    options: HandleOptions,
  ) {
    try {
      let response = new Response<TSuccessDataIn, TSuccessMetaIn>(
        xhr,
        xhr.response,
      );

      resolve(this.transformSuccess(response, options));
    } catch (error) {
      reject(error as Error);
    }
  }

  handleResponseError(
    _resolve: Resolve<TSuccessDataOut, TSuccessMetaOut>,
    reject: Reject,
    xhr: XMLHttpRequest,
    options: HandleOptions,
  ) {
    try {
      let request: XMLHttpRequest = xhr;

      for (const interceptor of this.errorHandlers) {
        try {
          interceptor(request);
        } catch (err) {
          log.error('Error in interceptor', err);
        }
      }

      const {status} = request;
      const rej = new Rejection(
        request,
        status === 401 ? Rejection.REASON_UNAUTHORIZED : Rejection.REASON_ERROR,
      );

      let rejectedResponse = this.transformRejection(rej, options);

      reject(rejectedResponse);
    } catch (error) {
      log.error('Could not handle response error', error);
      reject(error as Error);
    }
  }

  handleRequestError(
    resolve: Resolve<TSuccessDataOut, TSuccessMetaOut>,
    reject: Reject,
    xhr: XMLHttpRequest,
    options: HandleOptions,
  ) {
    const rej = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      _(
        'An error occurred during making the request. Most likely the web ' +
          'server does not respond.',
      ),
    );
    try {
      reject(this.transformRejection(rej, options));
    } catch {
      reject(rej);
    }
  }

  handleTimeout(
    resolve: Resolve<TSuccessDataOut, TSuccessMetaOut>,
    reject: Reject,
    xhr: XMLHttpRequest,
    options: HandleOptions,
  ) {
    const rej = new Rejection(
      xhr,
      Rejection.REASON_TIMEOUT,
      _('A timeout for the request to url {{- url}} occurred.', {
        url: options.url as string,
      }),
    );
    try {
      reject(this.transformRejection(rej, options));
    } catch {
      reject(rej);
    }
  }

  transformSuccess(
    response: Response<TSuccessDataIn, TSuccessMetaIn>,
    {
      transform = this.transform,
      ...options
    }: TransformArguments<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    > = {},
  ): Response<TSuccessDataOut, TSuccessMetaOut> {
    return transform.success(response, options);
  }

  transformRejection(
    rejection: Rejection,
    {
      transform = this.transform,
      ...options
    }: TransformArguments<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    > = {},
  ) {
    return transform.rejection(rejection, options);
  }

  addErrorHandler(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () =>
      (this.errorHandlers = this.errorHandlers.filter(h => h !== handler));
  }
}

export default Http;
