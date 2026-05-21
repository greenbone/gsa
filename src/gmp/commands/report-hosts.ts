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
import type ReportHost from 'gmp/models/report/host';
import {
  parseHosts,
  type ReportHostElement,
  type ReportResultsElement,
} from 'gmp/models/report/parser';

interface ReportHostsData {
  hosts?: {count?: number};
  host?: ReportHostElement | ReportHostElement[];
  results?: ReportResultsElement;
  filters?: FilterModelElement;
  [key: string]: unknown;
}

interface ReportHostsResponseData extends XmlResponseData {
  get_report_hosts?: {
    get_report_hosts_response: ReportHostsData;
  };
}

class ReportHostsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_hosts'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportHost[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportHostsResponseData;

    if (!root.get_report_hosts) {
      throw new Error(
        'Invalid response: get_report_hosts not found in response',
      );
    }

    const data = root.get_report_hosts.get_report_hosts_response;
    const filter = parseFilter(data);
    const {entities: hosts, counts} = parseHosts(data, filter);

    return response.set<ReportHost[], EntitiesMeta>(hosts, {
      filter,
      counts,
    });
  }
}

export default ReportHostsCommand;
