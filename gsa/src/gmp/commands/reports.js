/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import registerCommand from 'gmp/command';

import Report from 'gmp/models/report';

import {ALL_FILTER} from 'gmp/models/filter';

import DefaultTransform from 'gmp/http/transform/default';

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

  download({id}, {reportFormatId, deltaReportId, filter}) {
    return this.httpGet(
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

// vim: set ts=2 sw=2 tw=80:
