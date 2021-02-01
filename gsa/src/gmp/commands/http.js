/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

class HttpCommand {
  constructor(http, params = {}) {
    this.http = http;
    this._params = params;
  }

  getDefaultParam(name) {
    return this._params[name];
  }

  setDefaultParam(name, value) {
    this._params[name] = value;
    return this;
  }

  getParams(params, extraParams = {}, {includeDefaultParams = true} = {}) {
    const defaultParams = includeDefaultParams ? this._params : undefined;
    return {
      ...defaultParams,
      ...params,
      ...extraParams,
    };
  }

  httpGet(params, options = {}) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('get', {
      args: this.getParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }

  httpPost(params, options = {}) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('post', {
      data: this.getParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }
}

export default HttpCommand;
// vim: set ts=2 sw=2 tw=80:
