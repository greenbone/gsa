/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';

import Report from '../models/report.js';

export class ReportsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'get_reports', Report);
  }

  getElementsFromResponse(response) {
    return response.report;
  }

  getCountsFromResponse(response) {
    let es = response.reports;
    let ec = response.report_count;
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }

  getEntitiesResponse(root) {
    return root.get_reports.get_reports_response;
  }
}

register_command('report', EntityCommand, 'get_report', 'report_id', Report);
register_command('reports', ReportsCommand);

// vim: set ts=2 sw=2 tw=80:
