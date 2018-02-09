/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import logger from '../log.js';

import {is_defined} from '../utils/identity';

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';

import Report from '../models/report.js';

import {ALL_FILTER} from '../models/filter.js';

import DefaultTransform from '../http/transform/default.js';

const log = logger.getLogger('gmp.commands.reports');

class ReportsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'report', Report);
  }

  getEntitiesResponse(root) {
    return root.get_reports.get_reports_response;
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

  download({id}, {report_format_id, delta_report_id, filter}) {
    return this.httpGet({
      cmd: 'get_report',
      delta_report_id,
      report_id: id,
      report_format_id,
      filter: is_defined(filter) ? filter.all() : ALL_FILTER,
    }, {transform: DefaultTransform});
  }

  addAssets({id}, {filter = ''}) {
    return this.httpPost({
      cmd: 'create_asset',
      report_id: id,
      no_redirect: '1',
      filter,
    });
  }

  removeAssets({id}, {filter = ''}) {
    return this.httpPost({
      cmd: 'delete_asset',
      report_id: id,
      no_redirect: '1',
      filter,
      next: 'get_report', // seems not to work without next param
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
    return this.httpGet({
      id,
      delta_report_id,
      filter,
    }, options);
  }

  getElementFromRoot(root) {
    return root.get_report.get_reports_response.report;
  }
}

register_command('report', ReportCommand);
register_command('reports', ReportsCommand);

// vim: set ts=2 sw=2 tw=80:
