/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CancelToken from 'gmp/cancel';
import type Http from 'gmp/http/http';
import type {RequestOptions, ResponseType} from 'gmp/http/http';
import {ResponseRejection} from 'gmp/http/rejection';
import type {Meta} from 'gmp/http/response';
import transform, {
  type XmlMeta,
  type XmlResponseData,
} from 'gmp/http/transform/fastxml';
import {type Transform} from 'gmp/http/transform/transform';
import type {
  Data,
  HttpMethod,
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

type HttpCommandSuccessData = string | ArrayBuffer;

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

class HttpCommand {
  protected readonly http: Http;
  private readonly _params: HttpCommandGetParams;
  private readonly transform: Transform<
    HttpCommandSuccessData,
    Meta,
    XmlResponseData,
    XmlMeta
  >;

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

  /**
   * Sends an HTTP request using the specified method and options, and transforms
   * any `ResponseRejection` errors using the rejection transform function.
   *
   * This is especially useful for handling errors for request returning plain data instead of XML.
   * Because such requests cannot be transformed using the standard success transform,
   * we need to ensure that any errors, which contain XML, are still properly transformed.
   *
   * @returns A promise that resolves with the HTTP response or rejects with a transformed error.
   * @throws If the request fails, throws the error directly or a transformed `ResponseRejection` error.
   */
  protected async httpRequestWithRejectionTransform<
    TSuccessData extends HttpCommandSuccessData = string,
  >(method: HttpMethod, options: RequestOptions) {
    try {
      return await this.http.request<TSuccessData>(method, options);
    } catch (error) {
      if (error instanceof ResponseRejection) {
        throw this.transform.rejection(error);
      }
      throw error;
    }
  }

  /**
   * Sends an HTTP request with the specified method and options, applies the
   * rejection transform in case of errors, and processes the response using the
   * success transform.
   *
   * @returns A promise that resolves to the transformed response.
   * @throws If the request fails, throws the error directly or a transformed `ResponseRejection` error.
   */
  protected async httpRequestWithTransform<
    TSuccessData extends HttpCommandSuccessData = string,
  >(method: HttpMethod, options: RequestOptions) {
    const response = await this.httpRequestWithRejectionTransform<TSuccessData>(
      method,
      options,
    );
    return this.transform.success(response);
  }

  protected async httpGetWithTransform(
    params: HttpCommandInputParams = {},
    options: HttpCommandOptions = {},
  ) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return await this.httpRequestWithTransform('get', {
      args: this.getParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }

  protected async httpPostWithTransform(
    params: HttpCommandInputParams = {},
    options: HttpCommandOptions = {},
  ) {
    const {extraParams, includeDefaultParams, ...other} = options;
    return await this.httpRequestWithTransform('post', {
      data: this.postParams(params, extraParams, {includeDefaultParams}),
      ...other,
    });
  }
}

export default HttpCommand;
