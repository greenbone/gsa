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

import {is_defined, is_string, map} from '../utils.js';

import logger from '../log.js';

import {parse_collection_list} from '../collection/parser.js';

import Filter, {ALL_FILTER} from '../models/filter.js';
import {filter_string} from '../models/filter/utils.js';

import HttpCommand from './http.js';

const log = logger.getLogger('gmp.commands.entities');

class EntitiesCommand extends HttpCommand {

  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name + 's'});

    this.clazz = clazz;
    this.name = name;
  }

  getParams(params = {}, extra_params = {}) {
    const {filter, ...other} = params;
    const rparams = super.getParams(other, extra_params);

    if (is_defined(filter)) {
      rparams.filter = filter_string(filter);
    }
    return rparams;
  }

  getCollectionListFromRoot(root) {
    const response = this.getEntitiesResponse(root);
    return parse_collection_list(response, this.name, this.clazz);
  }

  getEntitiesResponse(root) {
    log.warn('getEntitiesResponse not implemented in', this.constructor.name);
    return root;
  }

  get(params, options) {
    return this.httpGet(params, options).then(response => {
      const {entities, filter, counts} = this.getCollectionListFromRoot(
        response.data);
      return response.set(entities, {filter, counts});
    });
  }

  getAll(params = {}, options) {
    const {filter} = params;
    if (!is_defined(filter)) {
      params.filter = ALL_FILTER;
    }
    else if (is_string(filter)) {
      params.filter = Filter.fromString(filter).all();
    }
    else {
      params.filter = filter.all();
    }
    return this.get(params, options);
  }

  export(entities) {
    return this.exportByIds(map(entities, entity => entity.id));
  }

  exportByIds(ids) {
    const params = {
      cmd: 'process_bulk',
      resource_type: this.name,
      bulk_select: 1,
      'bulk_export.x': 1,
    };
    for (const id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params, {plain: true})
      .then(response => response.setData(response.data.responseText));
  }

  exportByFilter(filter) {
    const params = {
      cmd: 'process_bulk',
      resource_type: this.name,
      bulk_select: 0,
      'bulk_export.x': 1,
      filter,
    };
    return this.httpPost(params, {plain: true})
      .then(response => response.setData(response.data.responseText));
  }

  delete(entities, extra_params) {
    return this.deleteByIds(map(entities, entity => entity.id), extra_params)
      .then(response => response.setData(entities));
  }

  deleteByIds(ids, extra_params = {}) {
    const params = {
      ...extra_params,
      cmd: 'bulk_delete',
      resource_type: this.name,
      no_redirect: '1',
    };
    for (const id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params).then(response => response.setData(ids));
  }

  deleteByFilter(filter, extra_params) {
    // FIXME change gmp to allow deletion by filter
    let deleted;
    return this.get({filter}).then(entities => {
      deleted = entities.getEntries();
      return this.delete(entities, extra_params);
    }).then(response => response.setData(deleted));
  }
}

export default EntitiesCommand;

// vim: set ts=2 sw=2 tw=80:
