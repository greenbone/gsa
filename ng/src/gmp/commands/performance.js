/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {
  is_defined,
  is_array,
} from '../utils/identity';

import HttpCommand from './http.js';

import register_command from '../command.js';

class PerformanceCommand extends HttpCommand {

  constructor(http) {
    super(http, {cmd: 'get_system_reports'});
  }

  get({slave_id = 0} = {}) {
    return this.httpGet({
      slave_id,
    }).then(response => {
      const {data = {}} = response;
      const {get_system_reports: sys_reports = {}} = data;
      const {get_system_reports_response: sys_response = {}} = sys_reports;
      const {system_report: reports} = sys_response;

      if (!is_defined(reports)) {
        throw new Error('Invalid response data for system reports');
      }

      return response.setData(is_array(reports) ? reports : [reports]);
    });
  }
}

register_command('performance', PerformanceCommand);

// vim: set ts=2 sw=2 tw=80:
