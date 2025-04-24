/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GmpHttp from 'gmp/http/gmp';
import {UrlParams as Params, UrlParamValue as ParamValue} from 'gmp/http/utils';

export interface HttpCommandOptions {
  extraParams?: Params;
  includeDefaultParams?: boolean;
}

export interface HttpCommandParams extends Params {
  cmd?: string;
}

export interface HttpCommandParamsOptions {
  includeDefaultParams?: boolean;
}

class HttpCommand {
  http: GmpHttp;
  _params: HttpCommandParams;

  constructor(http: GmpHttp, params: HttpCommandParams = {}) {
    this.http = http;
    this._params = params;
  }

  getDefaultParam(name: string) {
    return this._params[name];
  }

  setDefaultParam(name: string, value: ParamValue) {
    this._params[name] = value;
    return this;
  }

  getParams(
    params: HttpCommandParams,
    extraParams: HttpCommandParams = {},
    {includeDefaultParams = true}: HttpCommandParamsOptions = {},
  ): HttpCommandParams {
    const defaultParams = includeDefaultParams ? this._params : undefined;
    return {
      ...defaultParams,
      ...params,
      ...extraParams,
    };
  }

  httpGet(params: HttpCommandParams, options: HttpCommandOptions = {}) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('get', {
      args: this.getParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }

  httpPost(params: HttpCommandParams, options: HttpCommandOptions = {}) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('post', {
      data: this.getParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }
}

export default HttpCommand;
