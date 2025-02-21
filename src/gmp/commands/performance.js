/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import HttpCommand from 'gmp/commands/http';
import {isDefined, isArray} from 'gmp/utils/identity';


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
