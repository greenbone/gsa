/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CancelToken from 'gmp/cancel';
import {
  CanceledRejection,
  RequestRejection,
  ResponseRejection,
  TimeoutRejection,
} from 'gmp/http/rejection';
import Response, {type Meta} from 'gmp/http/response';
import {
  type Method as HttpMethod,
  type Transform,
  type TransformOptions,
} from 'gmp/http/transform/transform';
import {
  buildServerUrl,
  buildUrlParams,
  createFormData,
  type Data,
  type UrlParams as Params,
} from 'gmp/http/utils';
import _ from 'gmp/locale';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';

export type ErrorHandler = (request: XMLHttpRequest) => void;
type Resolve<TData, TMeta extends Meta> = (
  value: Response<TData, TMeta>,
) => void;
type Reject = (reason?: string | Error) => void;
export type ResponseType =
  | ''
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text';

interface TransformData<
  TSuccessDataIn,
  TSuccessMetaIn extends Meta,
  TSuccessDataOut,
  TSuccessMetaOut extends Meta,
> {
  transform: Transform<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  >;
}

export interface HandleOptions<
  TSuccessDataIn = string,
  TSuccessMetaIn extends Meta = Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> extends TransformData<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  > {
  cancelToken?: CancelToken;
  responseType?: ResponseType;
  method?: HttpMethod;
  url?: string;
  formdata?: FormData;
  force?: boolean;
}

interface TransformArguments<
  TSuccessDataIn = string,
  TSuccessMetaIn extends Meta = Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> extends TransformOptions,
    TransformData<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    > {}

export interface HttpOptions {
  apiServer: string;
  apiProtocol?: string;
  timeout?: number;
  token?: string;
}

interface RequestOptions<
  TSuccessDataIn,
  TSuccessMetaIn extends Meta,
  TSuccessDataOut = TSuccessDataIn,
  TSuccessMetaOut extends Meta = TSuccessMetaIn,
> extends TransformData<
    TSuccessDataIn,
    TSuccessMetaIn,
    TSuccessDataOut,
    TSuccessMetaOut
  > {
  args?: Params;
  data?: Data;
  url?: string;
  cancelToken?: CancelToken;
  force?: boolean;
  responseType?: ResponseType;
  [key: string]: unknown;
}

const log = logger.getLogger('gmp.http');

class Http {
  readonly url: string;
  readonly timeout?: number;
  private errorHandlers: Array<ErrorHandler>;
  // we need to store an object here to allow setting the token after login
  private readonly options: HttpOptions;

  constructor(options: HttpOptions) {
    const {timeout, apiServer, apiProtocol} = options;

    this.url = buildServerUrl(apiServer, 'gmp', apiProtocol);
    this.timeout = timeout;
    this.options = options;

    this.errorHandlers = [];

    log.debug('Using http options', options);
  }

  getParams() {
    return {
      token: this.options.token,
    };
  }

  request<
    TSuccessDataIn = string,
    TSuccessMetaIn extends Meta = Meta,
    TSuccessDataOut = TSuccessDataIn,
    TSuccessMetaOut extends Meta = TSuccessMetaIn,
  >(
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
    >,
  ): Promise<Response<TSuccessDataOut, TSuccessMetaOut>> {
    const self = this;
    let formdata: FormData | undefined;

    method = method.toUpperCase() as HttpMethod;

    if (args) {
      url = `${url}?${buildUrlParams({...this.getParams(), ...args})}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      formdata = createFormData({...this.getParams(), ...data});
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
            self.handleResponseError(reject, this, options);
          }
        };

        xhr.onerror = function () {
          self.handleRequestError(reject, this);
        };

        xhr.ontimeout = function () {
          self.handleTimeout(reject, {url: options.url});
        };

        xhr.onabort = function () {
          log.debug('Canceled http request', method, url);
        };

        if (isDefined(cancelToken)) {
          cancelToken.promise
            .then(reason => {
              xhr.abort();
              reject(new CanceledRejection(reason));
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

  handleSuccess<
    TSuccessDataIn,
    TSuccessMetaIn extends Meta,
    TSuccessDataOut,
    TSuccessMetaOut extends Meta,
  >(
    resolve: Resolve<TSuccessDataOut, TSuccessMetaOut>,
    reject: Reject,
    xhr: XMLHttpRequest,
    options: HandleOptions<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    >,
  ) {
    try {
      let response = new Response<TSuccessDataIn, TSuccessMetaIn>(xhr.response);

      resolve(
        this.transformSuccess<
          TSuccessDataIn,
          TSuccessMetaIn,
          TSuccessDataOut,
          TSuccessMetaOut
        >(response, options),
      );
    } catch (error) {
      reject(error as Error);
    }
  }

  handleResponseError<
    TSuccessDataIn,
    TSuccessMetaIn extends Meta,
    TSuccessDataOut,
    TSuccessMetaOut extends Meta,
  >(
    reject: Reject,
    xhr: XMLHttpRequest,
    options: HandleOptions<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    >,
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

      const rej = new ResponseRejection(xhr);
      const rejectedResponse = this.transformRejection(rej, options);
      reject(rejectedResponse);
    } catch (error) {
      log.error('Could not handle response error', error);
      reject(error as Error);
    }
  }

  handleRequestError(reject: Reject, xhr: XMLHttpRequest) {
    const rej = new RequestRejection(
      xhr,
      _(
        'An error occurred during making the request. Most likely the web ' +
          'server does not respond.',
      ),
    );
    reject(rej);
  }

  handleTimeout(reject: Reject, options: {url?: string}) {
    const rejection = new TimeoutRejection(
      _('A timeout for the request to url {{- url}} occurred.', {
        url: options.url as string,
      }),
    );
    reject(rejection);
  }

  transformSuccess<
    TSuccessDataIn,
    TSuccessMetaIn extends Meta,
    TSuccessDataOut,
    TSuccessMetaOut extends Meta,
  >(
    response: Response<TSuccessDataIn, TSuccessMetaIn>,
    {
      transform,
      ...options
    }: TransformArguments<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    >,
  ): Response<TSuccessDataOut, TSuccessMetaOut> {
    return transform.success(response, options);
  }

  transformRejection<
    TSuccessDataIn,
    TSuccessMetaIn extends Meta,
    TSuccessDataOut,
    TSuccessMetaOut extends Meta,
  >(
    rejection: ResponseRejection,
    {
      transform,
    }: TransformArguments<
      TSuccessDataIn,
      TSuccessMetaIn,
      TSuccessDataOut,
      TSuccessMetaOut
    >,
  ) {
    return transform.rejection(rejection);
  }

  addErrorHandler(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () =>
      (this.errorHandlers = this.errorHandlers.filter(h => h !== handler));
  }
}

export default Http;
