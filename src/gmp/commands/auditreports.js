/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import {convertBoolean} from 'gmp/commands/convert';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import DefaultTransform from 'gmp/http/transform/default';
import AuditReport from 'gmp/models/auditreport';
import {ALL_FILTER} from 'gmp/models/filter';
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

  download({id}, {reportFormatId, deltaReportId, filter}) {
    return this.httpGetWithTransform(
      {
        cmd: 'get_report',
        delta_report_id: deltaReportId,
        details: 1,
        report_id: id,
        report_format_id: reportFormatId,
        filter: isDefined(filter) ? filter.all() : ALL_FILTER,
      },
      {transform: DefaultTransform, responseType: 'arraybuffer'},
    );
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
        details: convertBoolean(details),
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
        lean: convertBoolean(lean),
        ignore_pagination: convertBoolean(ignorePagination),
        details: convertBoolean(details),
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
