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

import logger from './log.js';

import _ from './locale.js';

import {is_defined, has_value, is_array, extend} from './utils.js';

import PromiseFactory from './promise.js';
import Response from './response.js';
import xml2json from './xml2json.js';
import {parse_envelope_meta} from './parser.js';

const log = logger.getLogger('gmp.http');

class Rejection {

  constructor(xhr, reason = 'error', message = '') {
    this.name = 'Rejection';
    this.message = message;
    this.reason = reason;
    this.xhr = xhr;
    this.stack = (new Error()).stack;
  }

  isError() {
    return this.reason === 'error';
  }

  isTimeout() {
    return this.reason === 'timeout';
  }

  setMessage(message) {
    this.message = message;
    return this;
  }
}

export const DEFAULT_TIMEOUT = 60000; // 60 sec

export function build_url_params(params) {
  let argcount = 0;
  let uri = '';

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      if (argcount++) {
        uri += '&';
      }
      uri += encodeURIComponent(key) + '=' +
        encodeURIComponent(params[key]);
    }
  }
  return uri;
}

function formdata_append(formdata, key, value) {
  if (has_value(value)) {
    formdata.append(key, value);
  }
}

export class Http {

  constructor(url, options = {}) {
    const {
      timeout = DEFAULT_TIMEOUT,
      promise_factory = PromiseFactory,
    } = options;

    this.url = url;
    this.params = {};
    this.timeout = timeout;
    this.promise_factory = promise_factory;

    this.interceptors = [];

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
    force = false,
    ...other
  }) {
    const self = this;
    let formdata;

    method = method.toUpperCase();

    if (args) {
      url += '?' + build_url_params(extend({}, this.params, args));
    }

    if (method === 'GET' && is_defined(cache) && cache.has(url) && !force) {
      log.debug('Using http response for url', url, 'from cache', cache);

      const entry = cache.get(url);

      let responsedata = entry.value;

      responsedata = responsedata.setMeta({
        fromcache: true,
        dirty: entry.dirty,
      });

      return this.promise_factory.resolve(responsedata);
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      formdata = this._createFormData(extend({}, this.params, data));
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

    const promise = this.promise_factory.create(function(resolve, reject) {
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
        self.handleCancel(resolve, reject, this, options);
      };

      xhr.send(formdata);
    });

    return promise;
  }

  handleSuccess(resolve, reject, xhr, options) {
    try {
      const response = this.transformSuccess(xhr, options);

      this._cacheData(response, options);

      resolve(response);
    }
    catch (error) {
      log.error('Error while transforming success response', error);
      reject(error);
    }
  }

  handleError(resolve, reject, xhr, options) {
    let promise = PromiseFactory.resolve(xhr);

    for (const interceptor of this.interceptors) {
      promise = promise.then(interceptor.responseError);
    }

    promise.catch(request => {

      const rej = new Rejection(request, 'error');
      try {
        reject(this.transformRejection(rej, options));
      }
      catch (error) {
        log.error('Error while transforming error rejection', error);
        reject(error);
      }
    });
  }

  handleTimeout(resolve, reject, xhr, options) {
    const rej = new Rejection(xhr, 'timeout',
      _('A timeout for the request to url {{- url}} occurred.',
        {url: options.url}));
    try {
      reject(this.transformRejection(rej, options));
    }
    catch (error) {
      log.error('Error while transforming timeout rejection', error);
      reject(rej);
    }
  }

  handleCancel(resolve, reject, xhr, options) {
    // canceling the promise is currently not possible but should be supported
    // in future
    const rej = new Rejection(xhr, 'cancel');
    try {
      reject(this.transformRejection(rej, options));
    }
    catch (error) {
      log.error('Error while transforming cancel rejection', error);
      reject(error);
    }
  }

  transformSuccess(xhr, options) {
    return new Response(xhr, {fromcache: false});
  }

  transformRejection(rej, options) {
    return rej;
  }

  addInterceptor(interceptor) {
    this.interceptors.unshift(interceptor);
    return this;
  }
}

export class HttpInterceptor {

  constructor() {
    this.responseError = this.responseError.bind(this);
  }

  responseError(xhr) {
    return PromiseFactory.reject(xhr);
  }
}

export function build_server_url(server, path = '', protocol) {
  if (is_defined(protocol)) {
    if (!protocol.endsWith(':')) {
      protocol += ':';
    }
  }
  else {
    protocol = window.location.protocol;
  }
  return protocol + '//' + server + '/' + path;
}

export class GmpHttp extends Http {

  constructor(server, protocol, options) {
    const url = build_server_url(server, 'omp', protocol);
    super(url, options);

    this.params.xml = 1;
  }

  get token() {
    return this.params.token;
  }

  set token(token) {
    this.params.token = token;
  }

  transformSuccess(xhr, {plain = false, ...options}) {
    if (plain) {
      return super.transformSuccess(xhr, options);
    }
    try {
      const {envelope} = xml2json(xhr.responseXML);
      const meta = parse_envelope_meta(envelope);
      let response = super.transformSuccess(xhr, options);
      response = response.set(envelope, meta);
      return response;
    }
    catch (error) {
      log.error('An error occurred while converting gmp response to js for ' +
        'url', this.url, xhr);
      throw new Rejection(xhr, 'error', _('An error occurred while ' +
        'converting gmp response to js for url {{- url}}', {url: options.url}));
    }
  }

  transformRejection(rej, options) {
    if (rej.isError && rej.isError() && rej.xhr && rej.xhr.responseXML) {

      const root = xml2json(rej.xhr.responseXML).envelope;

      if (is_defined(root)) {
        rej.root = root;

        if (is_defined(root.gsad_response)) {
          return rej.setMessage(root.gsad_response.message);
        }

        if (is_defined(root.action_result)) {
          return rej.setMessage(root.action_result.message);
        }

        return rej.setMessage(_('Unknown Error'));
      }
    }
    return rej;
  }
}
// vim: set ts=2 sw=2 tw=80:
