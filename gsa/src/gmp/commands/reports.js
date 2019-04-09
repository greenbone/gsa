/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import logger from '../log';

import {isDefined} from '../utils/identity';

import registerCommand from '../command';

import Report from '../models/report';

import {ALL_FILTER} from '../models/filter';

import DefaultTransform from '../http/transform/default';
import FastXmlTransform from '../http/transform/fastxml';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.reports');

class ReportsCommand extends EntitiesCommand {
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
}

class ReportCommand extends EntityCommand {
  constructor(http) {
    super(http, 'report', Report);
  }

  import(args) {
    const {task_id, in_assets = 1, xml_file} = args;
    log.debug('Importing report', args);
    return this.httpPost({
      cmd: 'import_report',
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

  getDelta({id}, {id: delta_report_id}, {filter, ...options} = {}) {
    return this.httpGet(
      {
        id,
        delta_report_id,
        filter,
        ignore_pagination: 1,
      },
      {...options, transform: FastXmlTransform},
    ).then(this.transformResponse);
  }

  get({id}, {filter, ...options} = {}) {
    return this.httpGet(
      {
        id,
        filter,
        ignore_pagination: 1,
      },
      {...options, transform: FastXmlTransform},
    ).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_report.get_reports_response.report;
  }
}

registerCommand('report', ReportCommand);
registerCommand('reports', ReportsCommand);

// vim: set ts=2 sw=2 tw=80:
