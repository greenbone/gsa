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
import Filter from 'gmp/models/filter';
import {filterString, isFilter} from 'gmp/models/filter/utils';
import {hasValue, isDefined} from 'gmp/utils/identity';

export interface HttpCommandOptions {
  extraParams?: Params;
  includeDefaultParams?: boolean;
}

export interface HttpCommandGetParams extends Params {
  cmd?: string;
  filter?: string;
  filter_id?: string;
}

export interface HttpCommandPostParams extends Data {
  cmd?: string;
  filter?: string;
  filter_id?: string;
}

export interface HttpCommandInputParams {
  cmd?: string;
  filter?: Filter | string;
  [key: string]: unknown;
}

export interface HttpCommandParamsOptions {
  includeDefaultParams?: boolean;
}

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

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
    params: HttpCommandInputParams = {},
    extraParams: HttpCommandGetParams = {},
    {includeDefaultParams = true}: HttpCommandParamsOptions = {},
  ): HttpCommandGetParams {
    const {filter, ...other} = params;
    const filterParams: {
      filter_id?: string;
      filter?: string;
    } = {};
    if (hasValue(filter)) {
      if (isFilter(filter) && isDefined(filter.id)) {
        filterParams.filter_id = filter.id;
      } else {
        filterParams.filter = filterString(filter);
      }
    }
    const defaultParams = includeDefaultParams ? this._params : undefined;
    return {
      ...defaultParams,
      ...(other as HttpCommandGetParams),
      ...filterParams,
      ...extraParams,
    };
  }

  postParams(
    params: HttpCommandInputParams = {},
    extraParams: HttpCommandPostParams = {},
    {includeDefaultParams = true}: HttpCommandParamsOptions = {},
  ): HttpCommandPostParams {
    const {filter, ...other} = params;
    const filterParams: {
      filter_id?: string;
      filter?: string;
    } = {};
    if (hasValue(filter)) {
      if (isFilter(filter) && isDefined(filter.id)) {
        filterParams.filter_id = filter.id;
      } else {
        filterParams.filter = filterString(filter);
      }
    }
    const defaultParams = includeDefaultParams ? this._params : undefined;
    return {
      ...defaultParams,
      ...(other as HttpCommandPostParams),
      ...filterParams,
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
