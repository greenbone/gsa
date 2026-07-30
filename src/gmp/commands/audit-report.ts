/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {parseFilter} from 'gmp/collection/parser';
import type {EntitiesMeta} from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import type {XmlResponseData} from 'gmp/http/transform/fast-xml';
import AuditReport, {type AuditReportElement} from 'gmp/models/audit-report';
import {
  ALL_FILTER,
  type FilterModelElement,
  type FilterType,
} from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import {type Element} from 'gmp/models/model';
import ReportHost from 'gmp/models/report/host';
import type {ReportHostElement} from 'gmp/models/report/parser';
import {parseYesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface AuditReportCommandDownloadParams {
  id: string;
}

interface AuditReportCommandDownloadOptions {
  reportFormatId: string;
  deltaReportId?: string;
  filter?: FilterType;
}

interface AuditReportCommandAssetsParams {
  id: string;
  filter?: FilterType | string;
}

interface AuditReportCommandAlertParams {
  alert_id: string;
  report_id: string;
  filter?: FilterType | string;
}

interface AuditReportCommandGetParams {
  id?: string;
  filter?: FilterType | string;
  details?: boolean;
  ignorePagination?: boolean;
  lean?: boolean;
  options?: Record<string, unknown>;
}

interface AuditReportHostsData {
  host?: ReportHostElement | ReportHostElement[];
  hosts?: {count?: number};
  filters?: FilterModelElement;
  [key: string]: unknown;
}

interface AuditReportHostsResponseData extends XmlResponseData {
  get_audit_report_hosts?: {
    get_audit_report_hosts_response: AuditReportHostsData;
  };
}

class AuditReportCommand extends EntityCommand<
  AuditReport,
  AuditReportElement
> {
  constructor(http: Http) {
    super(http, 'report', AuditReport);
  }

  async download(
    {id}: AuditReportCommandDownloadParams,
    {reportFormatId, deltaReportId, filter}: AuditReportCommandDownloadOptions,
  ) {
    const allFilter = isDefined(filter) ? filter.all() : ALL_FILTER;
    return this.httpRequestWithRejectionTransform('get', {
      args: {
        cmd: 'get_report',
        delta_report_id: deltaReportId,
        details: 1,
        report_id: id,
        report_format_id: reportFormatId,
        filter: filterString(allFilter),
      },
      responseType: 'arraybuffer',
    });
  }

  addAssets({id, filter = ''}: AuditReportCommandAssetsParams) {
    return this.httpPostWithTransform({
      cmd: 'create_asset',
      report_id: id,
      filter,
    });
  }

  removeAssets({id, filter = ''}: AuditReportCommandAssetsParams) {
    return this.httpPostWithTransform({
      cmd: 'delete_asset',
      report_id: id,
      filter,
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  alert({alert_id, report_id, filter}: AuditReportCommandAlertParams) {
    return this.httpPostWithTransform({
      cmd: 'report_alert',
      alert_id,
      report_id,
      filter,
    });
  }

  async getDelta(
    {id}: {id: string},
    // eslint-disable-next-line @typescript-eslint/naming-convention
    {id: delta_report_id}: {id: string},
    {
      filter,
      details = true,
      ...options
    }: {
      filter?: FilterType | string;
      details?: boolean;
      [key: string]: unknown;
    } = {},
  ) {
    const response = await this.httpGetWithTransform(
      {
        id,
        delta_report_id,
        filter,
        ignore_pagination: 1,
        details: parseYesNo(details),
      },
      options,
    );
    return this.transformResponseToModel(response);
  }

  async get(
    {id, ...params}: AuditReportCommandGetParams,
    {
      filter,
      details = true,
      ignorePagination = true,
      lean = true,
      ...options
    }: AuditReportCommandGetParams = {},
  ) {
    const response = await this.httpGetWithTransform({
      id,
      filter,
      lean: parseYesNo(lean),
      ignore_pagination: parseYesNo(ignorePagination),
      details: parseYesNo(details),
      ...options,
      ...params,
    });
    return this.transformResponseToModel(response);
  }

  async getHosts(params: {
    report_id: string;
    filter?: FilterType | string;
  }): Promise<Response<ReportHost[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform({
      cmd: 'get_audit_report_hosts',
      details: 1,
      ...params,
    });

    const root = response.data as AuditReportHostsResponseData;

    if (!root.get_audit_report_hosts) {
      throw new Error(
        'Invalid response: get_audit_report_hosts not found in response',
      );
    }

    const data = root.get_audit_report_hosts.get_audit_report_hosts_response;
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

  getElementFromRoot(root: Element): AuditReportElement {
    // @ts-expect-error
    return root.get_report.get_reports_response.report;
  }
}

export default AuditReportCommand;
