/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {is_defined, has_value, extend, xml2json,
  PromiseFactory} from '../utils.js';

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
    this.timeout = timeout;
    this.promise_factory = promise_factory;
    this.params = {};

    if (!is_defined(timeout)) {
      this.timeout = TIMEOUT;
    }
    if (!is_defined(promise_factory)) {
      this.promise_factory = new PromiseFactory();
    }

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

    let promise = this.promise_factory.create(function(resolve, reject) {
      let xhr = new XMLHttpRequest();

      xhr.timeout = self.timeout;
      xhr.withCredentials = true; // allow to set Cookies

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(this);
        } else {
          self.handleReject(reject, this);
        }
      };

      xhr.onerror = function() {
        self.handleReject(reject, this);
      };
      xhr.open(method, uri, true);
      xhr.send(formdata);
    });

    return promise;
  }

  handleReject(reject, xhr) {
    for (let interceptor of this.interceptors) {
      interceptor.responseError(xhr);
    }
    reject(xhr);
  }
}

export class HttpInterceptor {
  // eslint-disable-next-line
  responseError(xhr) {
  }
}

export function build_server_url(server, path = '', protocol) {
  if (!is_defined(protocol)) {
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
      return xml2json(xhr.responseXML).envelope;
    }, xhr => {
      if (xhr.responseXML) {
        throw xml2json(xhr.responseXML).envelope;
      }
      throw xhr;
    });
  }
}
// vim: set ts=2 sw=2 tw=80:
