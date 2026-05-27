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
  parseClosedCvesFromEndpoint,
  type ClosedCvesEndpointData,
  type ReportClosedCve,
} from 'gmp/models/report/parser';

interface ReportClosedCvesData extends ClosedCvesEndpointData {
  filters?: FilterModelElement;
}

interface ReportClosedCvesResponseData extends XmlResponseData {
  get_report_closed_cves?: {
    get_report_closed_cves_response: ReportClosedCvesData;
  };
}

class ReportClosedCvesCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_closed_cves'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportClosedCve[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportClosedCvesResponseData;

    if (!root.get_report_closed_cves) {
      throw new Error(
        'Invalid response: get_report_closed_cves not found in response',
      );
    }

    const data = root.get_report_closed_cves.get_report_closed_cves_response;
    const filter = parseFilter(data);
    const {entities: closedCves, counts} = parseClosedCvesFromEndpoint(
      data,
      filter,
    );

    return response.set<ReportClosedCve[], EntitiesMeta>(closedCves, {
      filter,
      counts,
    });
  }
}

export default ReportClosedCvesCommand;
