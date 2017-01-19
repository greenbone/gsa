/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {is_defined} from '../../utils.js';
import logger from '../../log.js';

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';

import Filter from '../models/filter.js';

export const TASKS_FILTER_FILTER = Filter.fromString('type=task');
export const RESULTS_FILTER_FILTER = Filter.fromString('type=result');
export const NOTES_FILTER_FILTER = Filter.fromString('type=notes');
export const OVERRIDES_FILTER_FITLER = Filter.fromString('type=overrides');

const log = logger.getLogger('gmp.commands.filters');

export class FilterCommand extends EntityCommand {

  constructor(http) {
    super(http, 'filter', Filter);
  }

  create(args) {
    let {term, name, type, comment = ''} = args;
    let data = {
      cmd: 'create_filter',
      next: 'get_filter',
      term,
      name,
      optional_resource_type: type,
      comment,
    };
    log.debug('Creating new filter', args, data);
    return this.httpPost(data).then(xhr => this.getModelFromResponse(xhr));
  }

  getElementFromResponse(xhr) {
    return xhr.get_filter.get_filters_response.filter;
  }
}

export class FiltersCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'filter', Filter);
  }

  getEntitiesResponse(root) {
    return root.get_filters.get_filters_response;
  }

  getFilterFromResponse(response) {
    return undefined;
  }

  getCountsFromResponse(response) {
    let es = response.filters.find(elem => is_defined(elem._max));
    let ec = response.filter_count;
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }
}

export default FiltersCommand;

register_command('filter', FilterCommand);
register_command('filters', FiltersCommand);

// vim: set ts=2 sw=2 tw=80:
