/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
