/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import registerCommand from 'gmp/command';

import {isDefined, isArray} from 'gmp/utils/identity';

import HttpCommand from './http';

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

      if (!isDefined(reports)) {
        throw new Error('Invalid response data for system reports');
      }

      return response.setData(isArray(reports) ? reports : [reports]);
    });
  }
}

registerCommand('performance', PerformanceCommand);

// vim: set ts=2 sw=2 tw=80:
