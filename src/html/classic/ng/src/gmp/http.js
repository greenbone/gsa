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

import {is_defined, has_value, extend, xml2json} from '../utils.js';

import {PromiseFactory} from './promise.js';

const log = logger.getLogger('gmp.http');

class Rejection {

  constructor(reason, xhr) {
    this.reason = reason;
    this.xhr = xhr;
  }

  isError() {
    return this.reason === 'error';
  }

  isTimeout() {
    return this.reason === 'timeout';
  }
}

export const TIMEOUT = 10000; // 10 sec

export function build_url_params(params) {
  let argcount = 0;
  let uri = '';

  for (let key in params) {
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

export class Http {

  constructor(url, timeout, promise_factory) {
    this.url = url;
    this.timeout = is_defined(timeout) ? timeout : TIMEOUT;
    this.promise_factory = is_defined(promise_factory) ? promise_factory :
      new PromiseFactory();
    this.params = {};

    this.interceptors = [];
  }

  request(method, {args, data, uri = this.url}) {
    let self = this;
    let formdata;

    method = method.toUpperCase();

    if (data  && (method === 'POST' || method === 'PUT')) {
      formdata = new FormData();
      let pdata = extend({}, this.params, data);
      for (let key in pdata) {
        if (pdata.hasOwnProperty(key)) {
          let value = pdata[key];
          if (has_value(value)) { // don't add undefined and null values to form
            formdata.append(key, value);
          }
        }
      }
    }

    if (args) {
      uri += '?' + build_url_params(extend({}, this.params, args));
    }

    let xhr;

    let promise = this.promise_factory.create(function(resolve, reject) {
      xhr = new XMLHttpRequest();

      xhr.open(method, uri, true);

      xhr.timeout = self.timeout;
      xhr.withCredentials = true; // allow to set Cookies

      /* add request data for easier debugging of responses */
      xhr.uri = uri;
      xhr.formdata = formdata;

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          self.handleResolve(resolve, this);
        } else {
          self.handleReject(reject, this);
        }
      };

      xhr.onerror = function() {
        self.handleReject(reject, this);
      };

      xhr.ontimeout = function() {
        self.handleTimeout(reject, this);
      };

      xhr.onabort = function() {
        self.handleCancel(reject, this);
      };

      xhr.send(formdata);
    });

    return promise;
  }

  handleResolve(resolve, xhr) {
    resolve(xhr);
  }

  handleReject(reject, xhr) {
    for (let interceptor of this.interceptors) {
      interceptor.responseError(xhr);
    }
    reject(new Rejection('error', xhr));
  }

  handleTimeout(reject, xhr) {
    reject(new Rejection('timeout', xhr));
  }

  handleCancel(reject, xhr) {
    // canceling the promise is currently not possible but should be supported
    // in future
    reject(new Rejection('cancel', xhr));
  }
}

export class HttpInterceptor {
  // eslint-disable-next-line
  responseError(xhr) {
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

  constructor(server, protocol, timeout, promise_factory) {
    let url = build_server_url(server, 'omp', protocol);
    super(url, timeout, promise_factory);

    this.params.xml = 1;
  }

  get token() {
    return this.params.token;
  }

  set token(token) {
    this.params.token = token;
  }

  request(method, {plain = false, ...options}) {
    return super.request(method, options).then(xhr => {
      if (plain) {
        return xhr;
      }
      try {
        return xml2json(xhr.responseXML).envelope;
      }
      catch (error) {
        log.error('An error occured while converting gmp response to js for ' +
          'url', this.url, xhr);
        throw error;
      }
    }, xhr => {
      if (xhr.responseXML) {
        throw xml2json(xhr.responseXML).envelope;
      }
      throw xhr;
    });
  }
}
// vim: set ts=2 sw=2 tw=80:
