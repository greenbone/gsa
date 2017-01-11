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

import {map} from '../../utils.js';

import {EntitiesCommand, register_command} from '../command.js';

import Result from '../models/result.js';

export class ResultsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'result', Result);
  }

  getEntitiesResponse(root) {
    return root.get_results.get_results_response;
  }

  export(results) {
    return this.exportByIds(map(results, result => result.id));
  }

  exportByIds(ids) {
    let params = {
      cmd: 'process_bulk',
      resource_type: 'result',
      bulk_select: 1,
      'bulk_export.x': 1,
    };
    for (let id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params, {plain: true});
  }

  exportByFilter(filter) {
    let params = {
      cmd: 'process_bulk',
      resource_type: 'result',
      bulk_select: 0,
      'bulk_export.x': 1,
      filter,
    };
    return this.httpPost(params, {plain: true});
  }
};

register_command('results', ResultsCommand);

// vim: set ts=2 sw=2 tw=80:
