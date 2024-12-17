/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import DefaultTransform from 'gmp/http/transform/default';
import logger from 'gmp/log';
import {ALL_FILTER} from 'gmp/models/filter';
import Report from 'gmp/models/report';
import {isDefined} from 'gmp/utils/identity';

import {convertBoolean} from './convert';
import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.reports');

export class ReportsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'report', Report);
  }

  getEntitiesResponse(root) {
    return root.get_reports.get_reports_response;
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'report',
      group_column: 'severity',
      filter,
    });
  }

  getHighResultsAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'report',
      group_column: 'date',
      dataColumns: ['high', 'high_per_host'],
      filter,
    });
  }

  get(params, options) {
    return super.get(
      {
        details: 0, // ensure to request no details by default
        ...params,
        usage_type: 'scan',
      },
      options,
    );
  }
}

export class ReportCommand extends EntityCommand {
  constructor(http) {
    super(http, 'report', Report);
  }

  import(args) {
    const {task_id, in_assets = 1, xml_file} = args;
    log.debug('Creating report', args);
    return this.httpPost({
      cmd: 'create_report',
      task_id,
      in_assets,
      xml_file,
    });
  }

  download({id}, {reportFormatId, reportConfigId, deltaReportId, filter}) {
    return this.httpGet(
      {
        cmd: 'get_report',
        delta_report_id: deltaReportId,
        details: 1,
        report_id: id,
        report_config_id: reportConfigId,
        report_format_id: reportFormatId,
        filter: isDefined(filter) ? filter.all() : ALL_FILTER,
      },
      {transform: DefaultTransform, responseType: 'arraybuffer'},
    );
  }

  addAssets({id}, {filter = ''}) {
    return this.httpPost({
      cmd: 'create_asset',
      report_id: id,
      filter,
    });
  }

  removeAssets({id}, {filter = ''}) {
    return this.httpPost({
      cmd: 'delete_asset',
      report_id: id,
      filter,
    });
  }

  alert({alert_id, report_id, filter}) {
    return this.httpPost({
      cmd: 'report_alert',
      alert_id,
      report_id,
      filter,
    });
  }

  getDelta(
    {id},
    {id: delta_report_id},
    {filter, details = true, ...options} = {},
  ) {
    return this.httpGet(
      {
        id,
        delta_report_id,
        filter,
        ignore_pagination: 1,
        details: convertBoolean(details),
      },
      options,
    ).then(this.transformResponse);
  }

  get(
    {id},
    {
      filter,
      details = true,
      ignorePagination = true,
      lean = true,
      ...options
    } = {},
  ) {
    return this.httpGet(
      {
        id,
        filter,
        lean: convertBoolean(lean),
        ignore_pagination: convertBoolean(ignorePagination),
        details: convertBoolean(details),
      },
      options,
    ).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_report.get_reports_response.report;
  }
}

registerCommand('report', ReportCommand);
registerCommand('reports', ReportsCommand);
