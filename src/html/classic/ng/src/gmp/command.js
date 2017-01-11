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

import CollectionList from './collectionlist.js';
import CollectionCounts from './collectioncounts.js';

import Filter from './models/filter.js';

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
    let {extra_params, plain} = options;
    return this.http.request('get', {
      plain,
      args: this.getParams(params, extra_params),
    });
  }

  httpPost(params, options = {}) {
    let {extra_params, args, plain} = options;
    return this.http.request('post', {
      args,
      plain,
      data: this.getParams(params, extra_params),
    });
  }
}

export class EntitiesCommand extends HttpCommand {

  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name + 's'});

    this.clazz = clazz;
    this.name = name;
  }

  getParams(params, extra_params = {}) {
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

  getElementsFromResponse(response) {
    return response[this.name];
  }

  getEntitiesFromRespone(response) {
    return  map(this.getElementsFromResponse(response),
      element => new this.clazz(element));
  }

  getFilterFromResponse(response) {
    return new Filter(response.filters);
  }

  getCountsFromResponse(response) {
    let es = response[this.name + 's'];
    let ec = response[this.name + '_count'];
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }

  getCollectionCountsFromResponse(response) {
    return new CollectionCounts(this.getCountsFromResponse(response));
  }

  getCollectionListFromResponse(response) {
    return new CollectionList({
      entries: this.getEntitiesFromRespone(response),
      filter: this.getFilterFromResponse(response),
      counts: this.getCollectionCountsFromResponse(response),
    });
  }

  getCollectionListFromRoot(root) {
    let response = this.getEntitiesResponse(root);
    return this.getCollectionListFromResponse(response);
  }

  getEntitiesResponse(root) {
    log.warn('getEntitiesResponse not implemented in', this.constructor.name);
    return root;
  }

  get(filter) {
    return this.httpGet({filter}).then(root =>
        this.getCollectionListFromRoot(root)
    );
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

  get({id}) {
    return this.httpGet({id}).then(xhr => this.getModelFromResponse(xhr));
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
