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
  buildServerUrl,
  buildUrlParams,
  createFormData,
  type Data,
  type UrlParams as Params,
  type HttpMethod as HttpMethod,
} from 'gmp/http/utils';
import _ from 'gmp/locale';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';

export type ErrorHandler = (request: XMLHttpRequest) => void;
type Resolve<TData, TMeta extends Meta> = (
  value: Response<TData, TMeta>,
) => void;
type Reject = (reason?: string | Error) => void;
export type ResponseType = 'arraybuffer' | 'text';

export interface HttpOptions {
  apiServer: string;
  apiProtocol?: string;
  timeout?: number;
  token?: string;
}

interface RequestOptions {
  args?: Params;
  data?: Data;
  url?: string;
  cancelToken?: CancelToken;
  responseType?: ResponseType;
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

  request<TSuccessData = string, TSuccessMeta extends Meta = Meta>(
    method: HttpMethod,
    {args, data, url = this.url, cancelToken, responseType}: RequestOptions,
  ): Promise<Response<TSuccessData, TSuccessMeta>> {
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
    const promise = new Promise<Response<TSuccessData, TSuccessMeta>>(function (
      resolve,
      reject,
    ) {
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
          self.handleSuccess(resolve, reject, this);
        } else {
          self.handleResponseError(reject, this);
        }
      };

      xhr.onerror = function () {
        self.handleRequestError(reject, this);
      };

      xhr.ontimeout = function () {
        self.handleTimeout(reject, {url});
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
    });

    return promise;
  }

  handleSuccess<TSuccessData, TSuccessMeta extends Meta>(
    resolve: Resolve<TSuccessData, TSuccessMeta>,
    reject: Reject,
    xhr: XMLHttpRequest,
  ) {
    try {
      const response = new Response<TSuccessData, TSuccessMeta>(xhr.response);
      resolve(response);
    } catch (error) {
      reject(error as Error);
    }
  }

  handleResponseError(reject: Reject, xhr: XMLHttpRequest) {
    try {
      for (const interceptor of this.errorHandlers) {
        try {
          interceptor(xhr);
        } catch (err) {
          log.error('Error in interceptor', err);
        }
      }

      const rejection = new ResponseRejection(xhr);
      reject(rejection);
    } catch (error) {
      log.error('Could not handle response error', error);
      reject(error as Error);
    }
  }

  handleRequestError(reject: Reject, xhr: XMLHttpRequest) {
    const rejection = new RequestRejection(
      xhr,
      _(
        'An error occurred during making the request. Most likely the web ' +
          'server does not respond.',
      ),
    );
    reject(rejection);
  }

  handleTimeout(reject: Reject, options: {url?: string}) {
    const rejection = new TimeoutRejection(
      _('A timeout for the request to url {{- url}} occurred.', {
        url: options.url as string,
      }),
    );
    reject(rejection);
  }

  addErrorHandler(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () =>
      (this.errorHandlers = this.errorHandlers.filter(h => h !== handler));
  }
}

export default Http;
