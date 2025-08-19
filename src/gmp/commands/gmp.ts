/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand, {
  HttpCommandOptions,
  HttpCommandPostParams,
} from 'gmp/commands/http';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

class GmpCommand extends HttpCommand {
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
