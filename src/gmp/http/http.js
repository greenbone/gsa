/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';

import _ from 'gmp/locale';

import {isDefined, hasValue, isArray} from '../utils/identity';

import Rejection from './rejection';
import Response from './response';

import DefaultTransform from './transform/default';

import {
  buildUrlParams,
  getFeedAccessStatusMessage,
  findActionInXMLString,
} from './utils';

const log = logger.getLogger('gmp.http');

function formdata_append(formdata, key, value) {
  if (hasValue(value)) {
    formdata.append(key, value);
  }
}

class Http {
  constructor(url, options = {}) {
    const {timeout, transform = DefaultTransform} = options;

    this.url = url;
    this.params = {};
    this.timeout = timeout;

    this.errorHandlers = [];

    this.transform = transform;

    log.debug('Using http options', options);
  }

  _createFormData(data) {
    const formdata = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // don't add undefined and null values to form
        const value = data[key];
        if (isArray(value)) {
          for (const val of value) {
            formdata_append(formdata, key, val);
          }
        } else {
          formdata_append(formdata, key, value);
        }
      }
    }

    return formdata;
  }

  getParams() {
    return this.params;
  }

  request(
    method,
    {
      args,
      data,
      url = this.url,
      cancel_token,
      force = false,
      responseType,
      ...other
    },
  ) {
    const self = this;
    let formdata;

    method = method.toUpperCase();

    if (args) {
      url += '?' + buildUrlParams({...this.getParams(), ...args});
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      formdata = this._createFormData({...this.getParams(), ...data});
    }

    let xhr;
    const options = {
      method,
      url,
      formdata,
      force,
      ...other,
    };

    const promise = new Promise(function (resolve, reject) {
      xhr = new XMLHttpRequest();

      xhr.onloadstart = function () {
        // defer setting the responseType to avoid InvalidStateError with IE 11
        if (isDefined(responseType)) {
          xhr.responseType = responseType;
        }
      };

      xhr.open(method, url, true);

      xhr.timeout = self.timeout;
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

      if (isDefined(cancel_token)) {
        cancel_token.promise.then(reason => {
          xhr.abort();
          reject(new Rejection(this, Rejection.REASON_CANCEL, reason));
        });
      }

      xhr.send(formdata);
    });

    return promise;
  }

  handleSuccess(resolve, reject, xhr, options) {
    try {
      let response = new Response(xhr, xhr.response);

      response = this.transformSuccess(response, options);

      resolve(response);
    } catch (error) {
      reject(error);
    }
  }

  async handleResponseError(_resolve, reject, xhr, options) {
    try {
      let request = xhr;

      for (const interceptor of this.errorHandlers) {
        try {
          await interceptor(request);
        } catch (err) {
          request = err;
        }
      }

      const {status} = request;
      const rej = new Rejection(
        request,
        status === 401 ? Rejection.REASON_UNAUTHORIZED : Rejection.REASON_ERROR,
      );

      let rejectedResponse = await this.transformRejection(rej, options);

      const actionsRequiringFeedAccess = [
        'Run Wizard',
        'Create Task',
        'Save Task',
        'Create Target',
        'Save Target',
      ];

      if (
        rej.status === 404 &&
        findActionInXMLString(request.response, actionsRequiringFeedAccess)
      ) {
        const additionalMessage = await getFeedAccessStatusMessage(this);

        if (additionalMessage) {
          rejectedResponse.message = `${rejectedResponse.message}\n${additionalMessage}`;
        }
      }

      reject(rejectedResponse);
    } catch (error) {
      log.error('Could not handle response error', error);
      reject(error);
    }
  }

  handleRequestError(resolve, reject, xhr, options) {
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
    } catch (error) {
      reject(rej);
    }
  }

  handleTimeout(resolve, reject, xhr, options) {
    const rej = new Rejection(
      xhr,
      Rejection.REASON_TIMEOUT,
      _('A timeout for the request to url {{- url}} occurred.', {
        url: options.url,
      }),
    );
    try {
      reject(this.transformRejection(rej, options));
    } catch (error) {
      reject(rej);
    }
  }

  transformSuccess(response, {transform = this.transform, ...options} = {}) {
    return transform.success(response, options);
  }

  transformRejection(rejection, {transform = this.transform, ...options} = {}) {
    return transform.rejection(rejection, options);
  }

  addErrorHandler(handler) {
    this.errorHandlers.push(handler);
    return () =>
      (this.errorHandlers = this.errorHandlers.filter(h => h !== handler));
  }
}

export default Http;

// vim: set ts=2 sw=2 tw=80:
