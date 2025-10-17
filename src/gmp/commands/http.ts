/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CancelToken from 'gmp/cancel';
import type Http from 'gmp/http/http';
import type {ResponseType} from 'gmp/http/http';
import type {Meta} from 'gmp/http/response';
import transform, {
  type XmlMeta,
  type XmlResponseData,
} from 'gmp/http/transform/fastxml';
import {type Transform} from 'gmp/http/transform/transform';
import type {
  Data,
  UrlParams as Params,
  UrlParamValue as ParamValue,
} from 'gmp/http/utils';
import type Filter from 'gmp/models/filter';
import {filterString, isFilter} from 'gmp/models/filter/utils';
import {hasValue, isDefined} from 'gmp/utils/identity';

export interface HttpCommandOptions {
  cancelToken?: CancelToken;
  force?: boolean;
  responseType?: ResponseType;
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
  protected readonly http: Http;
  private readonly _params: HttpCommandGetParams;
  private readonly transform: Transform<string, Meta, XmlResponseData, XmlMeta>;

  constructor(http: Http, params: HttpCommandGetParams = {}) {
    this.http = http;
    this._params = params;
    this.transform = transform;
  }

  protected setDefaultParam(name: string, value: ParamValue) {
    this._params[name] = value;
    return this;
  }

  protected getParams(
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

  protected postParams(
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

  protected httpGetWithTransform(
    params: HttpCommandInputParams = {},
    options: HttpCommandOptions = {},
  ) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('get', {
      args: this.getParams(params, extraParams, {includeDefaultParams}),
      transform: this.transform,
      ...other,
    });
  }

  protected httpPostWithTransform(
    params: HttpCommandInputParams = {},
    options: HttpCommandOptions = {},
  ) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return this.http.request('post', {
      data: this.postParams(params, extraParams, {includeDefaultParams}),
      transform: this.transform,
      ...other,
    });
  }
}

export default HttpCommand;
