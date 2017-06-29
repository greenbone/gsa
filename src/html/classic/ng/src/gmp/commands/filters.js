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

import logger from '../log.js';

import CollectionCounts from '../collectioncounts.js';
import {EntitiesCommand, EntityCommand, register_command} from '../command.js';
import {parse_collection_list} from '../parser.js';

import Filter from '../models/filter.js';

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
    return this.httpPost(data).then(this.transformResponse);
  }

  save(args) {
    let {id, term, name, type, comment = ''} = args;
    let data = {
      cmd: 'save_filter',
      next: 'get_filter',
      comment,
      id,
      name,
      optional_resource_type: type,
      term,
    };
    log.debug('Saving filter', args, data);
    return this.httpPost(data).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_filter.get_filters_response.filter;
  }
}

// FIXME parsing counts is horrible

const parse_filter = element => {
  return new Filter(element.filters[0]);
};

const parse_counts = element => {
  let es = element.filters[1];
  let ec = element.filter_count;
  return {
    first: es._start,
    rows: es._max,
    length: ec.page,
    all: ec.__text,
    filtered: ec.filtered,
  };
};

const parse_collection_counts = response => {
  return new CollectionCounts(parse_counts(response));
};

export class FiltersCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'filter', Filter);
  }

  getEntitiesResponse(root) {
    return root.get_filters.get_filters_response;
  }

  getCollectionListFromRoot(root, meta) {
    let response = this.getEntitiesResponse(root);
    return parse_collection_list(response, this.name, this.clazz, {
      meta,
      filter_parse_func: parse_filter,
      collection_count_parse_func: parse_collection_counts,
    });
  }
}

export default FiltersCommand;

register_command('filter', FilterCommand);
register_command('filters', FiltersCommand);

// vim: set ts=2 sw=2 tw=80:
