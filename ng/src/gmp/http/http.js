/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import logger from '../log.js';

import _ from '../locale.js';

import {is_defined, has_value, is_array} from '../utils.js';

import Promise from '../promise.js';

import Rejection from './rejection.js';
import Response from './response.js';

import Transform from './transform/transform.js';

import {build_url_params} from './utils.js';

const log = logger.getLogger('gmp.http');

export const DEFAULT_TIMEOUT = 300000; // 5 min

function formdata_append(formdata, key, value) {
  if (has_value(value)) {
    formdata.append(key, value);
  }
}

class Http {

  constructor(url, options = {}) {
    const {
      timeout = DEFAULT_TIMEOUT,
      transform = new Transform(),
    } = options;

    this.url = url;
    this.params = {};
    this.timeout = timeout;

    this.interceptors = [];

    this.transform = transform;

    log.debug('Using http options', options);
  }

  _cacheData(data, options) {
    const {cache, url, method} = options;
    if (is_defined(cache) && is_defined(url) && method === 'GET') {
      log.debug('Storing data for url', url, 'in cache', cache);
      cache.set(url, data);
    }
    return this;
  }

  _createFormData(data) {
    const formdata = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) { // don't add undefined and null values to form
        const value = data[key];
        if (is_array(value)) {
          for (const val of value) {
            formdata_append(formdata, key, val);
          }
        }
        else {
          formdata_append(formdata, key, value);
        }
      }
    }

    return formdata;
  }

  request(method, {
    args,
    data,
    url = this.url,
    cache,
    cancel_token,
    force = false,
    ...other
  }) {
    const self = this;
    let formdata;

    method = method.toUpperCase();

    if (args) {
      url += '?' + build_url_params({...this.params, ...args});
    }

    if (method === 'GET' && is_defined(cache) && cache.has(url) && !force) {
      log.debug('Using http response for url', url, 'from cache', cache);

      const entry = cache.get(url);

      let responsedata = entry.value;

      responsedata = responsedata.setMeta({
        fromcache: true,
        dirty: entry.dirty,
      });

      return Promise.resolve(responsedata);
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      formdata = this._createFormData({...this.params, ...data});
    }

    let xhr;
    const options = {
      method,
      url,
      formdata,
      cache,
      force,
      ...other,
    };

    const promise = Promise.create(function(resolve, reject) {
      xhr = new XMLHttpRequest();

      xhr.open(method, url, true);

      xhr.timeout = self.timeout;
      xhr.withCredentials = true; // allow to set Cookies

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          self.handleSuccess(resolve, reject, this, options);
        }
        else {
          self.handleError(resolve, reject, this, options);
        }
      };

      xhr.onerror = function() {
        self.handleError(resolve, reject, this, options);
      };

      xhr.ontimeout = function() {
        self.handleTimeout(resolve, reject, this, options);
      };

      xhr.onabort = function() {
        log.debug('Canceled http request', method, url);
      };

      if (is_defined(cancel_token)) {
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
      let response = new Response(xhr, xhr.response, {fromcache: false});

      response = this.transformSuccess(response, options);

      this._cacheData(response, options);

      resolve(response);
    }
    catch (error) {
      reject(error);
    }
  }

  handleError(resolve, reject, xhr, options) {
    let promise = Promise.resolve(xhr);

    for (const interceptor of this.interceptors) {
      promise = promise.then(interceptor.responseError);
    }

    promise.catch(request => {

      const rej = new Rejection(request, Rejection.REASON_ERROR);
      try {
        reject(this.transformRejection(rej, options));
      }
      catch (error) {
        reject(error);
      }
    });
  }

  handleTimeout(resolve, reject, xhr, options) {
    const rej = new Rejection(xhr, Rejection.REASON_TIMEOUT,
      _('A timeout for the request to url {{- url}} occurred.',
        {url: options.url}));
    try {
      reject(this.transformRejection(rej, options));
    }
    catch (error) {
      reject(rej);
    }
  }

  transformSuccess(response, options) {
    return this.transform.success(response, options);
  }

  transformRejection(rejection, options) {
    return this.transform.rejection(rejection, options);
  }

  addInterceptor(interceptor) {
    this.interceptors.unshift(interceptor);
    return this;
  }
}

export default Http;

// vim: set ts=2 sw=2 tw=80:
