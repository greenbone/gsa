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
  parseCvesFromEndpoint,
  type CvesEndpointData,
  type ReportActiveCve,
} from 'gmp/models/report/parser';

interface ReportCvesData extends CvesEndpointData {
  filters?: FilterModelElement;
}

interface ReportCvesResponseData extends XmlResponseData {
  get_report_cves?: {
    get_report_cves_response: ReportCvesData;
  };
}

class ReportCvesCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_cves'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportActiveCve[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportCvesResponseData;

    if (!root.get_report_cves) {
      throw new Error(
        'Invalid response: get_report_cves not found in response',
      );
    }

    const data = root.get_report_cves.get_report_cves_response;
    const filter = parseFilter(data);
    const {entities: cves, counts} = parseCvesFromEndpoint(data, filter);

    return response.set<ReportActiveCve[], EntitiesMeta>(cves, {
      filter,
      counts,
    });
  }
}

export default ReportCvesCommand;
