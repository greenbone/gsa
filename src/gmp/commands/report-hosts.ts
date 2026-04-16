/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntityCommand, {type EntityCommandParams} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import ReportHostsResponse, {
  type ReportHostsResponseElement,
} from 'gmp/models/report-host';
import {parseYesNo} from 'gmp/parser';

interface ReportHostsCommandGetOptions {
  filter?: string;
  details?: boolean;
  ignorePagination?: boolean;
  lean?: boolean;
  [key: string]: unknown;
}

class ReportHostsCommand extends EntityCommand<
  ReportHostsResponse,
  ReportHostsResponseElement
> {
  constructor(http: Http) {
    super(http, 'report_hosts', ReportHostsResponse);
  }

  async get(
    {id, ...params}: EntityCommandParams,
    {
      filter,
      details = true,
      ignorePagination = true,
      lean = true,
      ...options
    }: ReportHostsCommandGetOptions = {},
  ) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_hosts',
      report_id: id,
      filter,
      lean: parseYesNo(lean),
      ignore_pagination: parseYesNo(ignorePagination),
      details: parseYesNo(details),
      ...params,
      ...options,
    });

    let entity = this.getModelFromResponse(response);

    return response.setData(entity);
  }

  getElementFromRoot(root: XmlResponseData): ReportHostsResponseElement {
    // @ts-expect-error
    return root.get_report_hosts?.get_report_hosts_response;
  }
}

registerCommand('reportHosts', ReportHostsCommand);

export default ReportHostsCommand;
