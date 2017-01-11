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

  constructor(http, cmd, clazz) {
    super(http, {cmd});

    this.clazz = clazz;
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
    throw new Error('getElementsFromResponse not implemented in ' +
      this.constructor.name);
  }

  getEntitiesFromRespone(response) {
    return  map(this.getElementsFromResponse(response),
      element => new this.clazz(element));
  }

  getFilterFromResponse(response) {
    return new Filter(response.filters);
  }

  getCountsFromResponse(response) {
    throw new Error('getCountsFromResponse not implemented in ' +
      this.constructor.name);
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

  getElementFromResponse(root) {
    throw new Error('getElementFromResponse not implemented in ' +
      this.constructor.name);
  }
}

// vim: set ts=2 sw=2 tw=80:
