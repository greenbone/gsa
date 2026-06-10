/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
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
import ReportHost from 'gmp/models/report/host';
import {type ReportHostElement} from 'gmp/models/report/parser';
import {map} from 'gmp/utils/array';

interface ReportHostsData {
  host?: ReportHostElement | ReportHostElement[];
  hosts?: {count?: number};
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

    const hostsArray = map(data.host, host => ReportHost.fromElement(host));

    const counts = new CollectionCounts({
      first: 1,
      all: data.hosts?.count ?? hostsArray.length,
      filtered: hostsArray.length,
      length: hostsArray.length,
      rows: hostsArray.length,
    });

    return response.set<ReportHost[], EntitiesMeta>(hostsArray, {
      filter,
      counts,
    });
  }
}

export default ReportHostsCommand;
