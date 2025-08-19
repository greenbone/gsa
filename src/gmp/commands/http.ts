/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GmpHttp from 'gmp/http/gmp';
import {
  Data,
  UrlParams as Params,
  UrlParamValue as ParamValue,
} from 'gmp/http/utils';

export interface HttpCommandOptions {
  extraParams?: Params;
  includeDefaultParams?: boolean;
}

export interface HttpCommandGetParams extends Params {
  cmd?: string;
}

export interface HttpCommandPostParams extends Data {
  cmd?: string;
}

export interface HttpCommandInputParams {
  cmd?: string;
  [key: string]: unknown;
}

export interface HttpCommandParamsOptions {
  includeDefaultParams?: boolean;
}

class HttpCommand {
  http: GmpHttp;
  _params: HttpCommandGetParams;

  constructor(http: GmpHttp, params: HttpCommandGetParams = {}) {
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
    params: HttpCommandInputParams,
    extraParams: HttpCommandGetParams = {},
    {includeDefaultParams = true}: HttpCommandParamsOptions = {},
  ): HttpCommandGetParams {
    const defaultParams = includeDefaultParams ? this._params : undefined;
    return {
      ...defaultParams,
      ...(params as HttpCommandGetParams),
      ...extraParams,
    };
  }

  postParams(
    params: HttpCommandInputParams,
    extraParams: HttpCommandPostParams = {},
    {includeDefaultParams = true}: HttpCommandParamsOptions = {},
  ): HttpCommandPostParams {
    const defaultParams = includeDefaultParams ? this._params : undefined;
    return {
      ...defaultParams,
      ...(params as HttpCommandPostParams),
      ...extraParams,
    };
  }

  httpGet(params: HttpCommandInputParams, options: HttpCommandOptions = {}) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('get', {
      args: this.getParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }

  httpPost(params: HttpCommandInputParams, options: HttpCommandOptions = {}) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('post', {
      data: this.postParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }
}

export default HttpCommand;
