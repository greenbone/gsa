/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import AuditReport from 'gmp/models/audit-report';
import {ALL_FILTER} from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import {parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export class AuditReportsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'report', AuditReport);
  }

  getEntitiesResponse(root) {
    return root.get_reports.get_reports_response;
  }

  getComplianceAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'report',
      group_column: 'compliant',
      usage_type: 'audit',
      filter,
    });
  }

  get(params, options) {
    return super.get(
      {
        details: 0,
        ...params,
        usage_type: 'audit',
      },
      options,
    );
  }
}

export class AuditReportCommand extends EntityCommand {
  constructor(http) {
    super(http, 'report', AuditReport);
  }

  async download({id}, {reportFormatId, deltaReportId, filter}) {
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

  addAssets({id}, {filter = ''}) {
    return this.httpPostWithTransform({
      cmd: 'create_asset',
      report_id: id,
      filter,
    });
  }

  removeAssets({id}, {filter = ''}) {
    return this.httpPostWithTransform({
      cmd: 'delete_asset',
      report_id: id,
      filter,
    });
  }

  alert({alert_id, report_id, filter}) {
    return this.httpPostWithTransform({
      cmd: 'report_alert',
      alert_id,
      report_id,
      filter,
    });
  }

  async getDelta(
    {id},
    {id: delta_report_id},
    {filter, details = true, ...options} = {},
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
    {id},
    {
      filter,
      details = true,
      ignorePagination = true,
      lean = true,
      ...options
    } = {},
  ) {
    const response = await this.httpGetWithTransform(
      {
        id,
        filter,
        lean: parseYesNo(lean),
        ignore_pagination: parseYesNo(ignorePagination),
        details: parseYesNo(details),
      },
      options,
    );
    return this.transformResponseToModel(response);
  }

  getElementFromRoot(root) {
    return root.get_report.get_reports_response.report;
  }
}

registerCommand('auditreport', AuditReportCommand);
registerCommand('auditreports', AuditReportsCommand);
