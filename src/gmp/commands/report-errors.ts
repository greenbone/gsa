/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseFilter} from 'gmp/collection/parser';
import type {EntitiesMeta} from 'gmp/commands/entities';
import HttpCommand, {
  type HttpCommandInputParams,
  type HttpCommandOptions,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import type {XmlResponseData} from 'gmp/http/transform/fast-xml';
import type {FilterModelElement} from 'gmp/models/filter';
import {
  parseErrors,
  type ErrorsElement,
  type ReportError,
  type ReportHostElement,
} from 'gmp/models/report/parser';

interface ReportErrorsData {
  errors?: ErrorsElement;
  host?: ReportHostElement | ReportHostElement[];
  filters?: FilterModelElement;
  [key: string]: unknown;
}

interface ReportErrorsResponseData extends XmlResponseData {
  get_report_errors?: {
    get_report_errors_response: ReportErrorsData;
  };
}

class ReportErrorsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_errors'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportError[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportErrorsResponseData;

    if (!root.get_report_errors) {
      throw new Error(
        'Invalid response: get_report_errors not found in response',
      );
    }

    const data = root.get_report_errors.get_report_errors_response;
    const filter = parseFilter(data);
    const {entities: errors, counts} = parseErrors(data, filter);

    return response.set<ReportError[], EntitiesMeta>(errors, {
      filter,
      counts,
    });
  }
}

export default ReportErrorsCommand;
