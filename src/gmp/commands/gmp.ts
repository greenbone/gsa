/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand, {
  HttpCommandInputParams,
  HttpCommandOptions,
  HttpCommandGetParams,
  HttpCommandParamsOptions,
  HttpCommandPostParams,
} from 'gmp/commands/http';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import {UrlParams} from 'gmp/http/utils';
import ActionResult from 'gmp/models/actionresult';
import {filterString} from 'gmp/models/filter/utils';
import {isDefined, hasValue} from 'gmp/utils/identity';

interface Filter {
  id?: string;
}

export interface GmpCommandInputParams extends HttpCommandInputParams {
  filter?: Filter | string;
}

export interface GmpCommandParams extends HttpCommandGetParams {
  filter?: string;
  filter_id?: string;
}

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

const isFilter = (filter: Filter | string): filter is Filter => {
  return isDefined((filter as Filter).id);
};

class GmpCommand extends HttpCommand {
  getParams(
    params: GmpCommandInputParams = {},
    extraParams?: UrlParams,
    options?: HttpCommandParamsOptions,
  ): GmpCommandParams {
    const {filter, ...other} = params;
    const rParams = super.getParams(other, extraParams, options);

    if (hasValue(filter)) {
      if (isFilter(filter)) {
        rParams.filter_id = filter.id;
      } else {
        rParams.filter = filterString(filter);
      }
    }

    return rParams;
  }

  transformActionResult(
    response: Response<XmlResponseData, XmlMeta>,
  ): Response<ActionResult, XmlMeta> {
    return response.setData(new ActionResult(response.data));
  }

  /**
   * Creates a HTTP POST Request returning an ActionResult
   *
   * @returns A Promise returning a Response with an ActionResult model as data
   */
  async action(params: HttpCommandPostParams, options?: HttpCommandOptions) {
    const response = await this.httpPost(params, options);
    return this.transformActionResult(response);
  }
}

export default GmpCommand;
