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

import {is_defined, extend, map} from '../utils.js';
import logger from '../log.js';

import {parse_collection_list} from './models/parser.js';

const log = logger.getLogger('gmp.command');

const COMMANDS = {
};

export function register_command(name, clazz, ...options) {
  COMMANDS[name] = {clazz, options};
}

export function get_commands() {
  return COMMANDS;
}

export class HttpCommand {

  constructor(http, params) {
    this.http = http;
    this._params = is_defined(params) ? params : {};
  }

  getParam(name) {
    return this._params[name];
  }

  setParam(name, value) {
    this._params[name] = value;
    return this;
  }

  getParams(params, extra_params = {}) {
    return extend({}, this._params, params, extra_params);
  }

  httpGet(params, options = {}) {
    let {extra_params, ...other} = options;
    return this.http.request('get', {
      args: this.getParams(params, extra_params),
      ...other,
    });
  }

  httpPost(params, options = {}) {
    let {extra_params, ...other} = options;
    return this.http.request('post', {
      data: this.getParams(params, extra_params),
      ...other,
    });
  }
}

export class EntitiesCommand extends HttpCommand {

  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name + 's'});

    this.clazz = clazz;
    this.name = name;
  }

  getParams(params = {}, extra_params = {}) {
    let {filter, ...other} = params;
    let rparams = super.getParams(other, extra_params);

    if (is_defined(filter)) {
      if (is_defined(filter.toFilterString)) {
        rparams.filter = filter.toFilterString();
      }
      else {
        rparams.filter = filter;
      }
    }
    return rparams;
  }

  getCollectionListFromRoot(root) {
    let response = this.getEntitiesResponse(root);
    return parse_collection_list(response, this.name, this.clazz);
  }

  getEntitiesResponse(root) {
    log.warn('getEntitiesResponse not implemented in', this.constructor.name);
    return root;
  }

  get(params, options) {
    return this.httpGet(params, options).then(root => {
        return this.getCollectionListFromRoot(root);
    });
  }

  export(entities) {
    return this.exportByIds(map(entities, entity => entity.id));
  }

  exportByIds(ids) {
    let params = {
      cmd: 'process_bulk',
      resource_type: this.name,
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
      resource_type: this.name,
      bulk_select: 0,
      'bulk_export.x': 1,
      filter,
    };
    return this.httpPost(params, {plain: true});
  }

  delete(entities) {
    return this.deleteByIds(map(entities, entity => entity.id))
      .then(() => entities);
  }

  deleteByIds(ids) {
    let params = {
      cmd: 'bulk_delete',
      resource_type: this.name,
    };
    for (let id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params).then(() => ids);
  }

  deleteByFilter(filter) {
    // FIXME change gmp to allow deletion by filter
    let deleted;
    return this.get(filter).then(entities => {
      deleted = entities;
      return this.delete(entities);
    }).then(() => deleted);
  }
}

export class EntityCommand extends HttpCommand {

  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name});

    this.clazz = clazz;
    this.name = name;
    this.id_name = name + '_id';
  }

  getParams(params, extra_params = {}) {
    let {id, ...other} = params;
    let rparams = super.getParams(other, extra_params);
    if (is_defined(id)) {
      rparams[this.id_name] = id;
    }
    return rparams;
  }

  getModelFromResponse(root) {
    return new this.clazz(this.getElementFromResponse(root));
  }

  get({id}, options) {
    return this.httpGet({id}, options).then(
      xhr => this.getModelFromResponse(xhr));
  }

  clone({id}) {
    let extra_params = {
      id, // we need plain 'id' in the submitted form data not 'xyz_id'
    };
    return this.httpPost({
      cmd: 'clone',
      resource_type: this.name,
      next: 'get_'  + this.name,
    }, {
      extra_params,
    }).then(xhr => {
      log.debug('Cloned', this.name);
      return this.getModelFromResponse(xhr);
    })
    .catch(err => {
      log.error('An error occured while cloning', this.name, id, err);
      throw err;
    });
  }

  delete({id}) {
    log.debug('Deleting', this.name, id);

    let params = {cmd: 'delete_' + this.name, id};
    return this.httpPost(params);
  }

  getElementFromResponse(root) {
    throw new Error('getElementFromResponse not implemented in ' +
      this.constructor.name);
  }
}

// vim: set ts=2 sw=2 tw=80:
