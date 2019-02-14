/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

class HttpCommand {
  constructor(http, params = {}) {
    this.http = http;
    this._params = params;
  }

  getParam(name) {
    return this._params[name];
  }

  setParam(name, value) {
    this._params[name] = value;
    return this;
  }

  getParams(params, extra_params = {}) {
    return {
      ...this._params,
      ...params,
      ...extra_params,
    };
  }

  httpGet(params, options = {}) {
    const {extra_params, ...other} = options;
    return this.http.request('get', {
      args: this.getParams(params, extra_params),
      ...other,
    });
  }

  httpPost(params, options = {}) {
    const {extra_params, ...other} = options;
    return this.http.request('post', {
      data: this.getParams(params, extra_params),
      ...other,
    });
  }
}

export default HttpCommand;
// vim: set ts=2 sw=2 tw=80:
