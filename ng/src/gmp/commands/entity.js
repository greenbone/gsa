/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {is_defined} from '../utils.js';

import logger from '../log.js';

import {filter_string} from '../models/filter/utils.js';

import DefaultTransform from '../http/transform/default.js';

import HttpCommand from './http.js';

const log = logger.getLogger('gmp.commands.entities');

class EntityCommand extends HttpCommand {

  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name});

    this.clazz = clazz;
    this.name = name;
    this.id_name = name + '_id';

    this.transformResponse = this.transformResponse.bind(this);
  }

  getParams(params, extra_params = {}) {
    const {id, filter, ...other} = params;
    const rparams = super.getParams(other, extra_params);

    if (is_defined(filter)) {
      rparams.filter = filter_string(filter);
    }
    if (is_defined(id)) {
      rparams[this.id_name] = id;
    }
    return rparams;
  }

  getModelFromResponse(response) {
    return new this.clazz(this.getElementFromRoot(response.data));
  }

  get({id}, {filter, ...options} = {}) {
    return this.httpGet({id, filter}, options).then(this.transformResponse);
  }

  transformResponse(response) {
    let entity = this.getModelFromResponse(response);
    if (!is_defined(entity.id)) {
      log.warn('Entity with undefined id found.'); // FIXME gsad MUST return 404 if no entity has been found
      entity = undefined;
    }
    return response.setData(entity);
  }

  clone({id}) {
    const extra_params = {
      id, // we need plain 'id' in the submitted form data not 'xyz_id'
    };
    return this.httpPost({
      cmd: 'clone',
      resource_type: this.name,
      next: 'get_' + this.name,
    }, {
      extra_params,
    }).then(response => {
      log.debug('Cloned', this.name, id);
      return this.transformResponse(response);
    })
    .catch(err => {
      log.error('An error occurred while cloning', this.name, id, err);
      throw err;
    });
  }

  delete({id}) {
    log.debug('Deleting', this.name, id);

    const params = {
      cmd: 'delete_' + this.name,
      id,
      no_redirect: '1',
    };
    return this.httpPost(params);
  }

  export({id}) {
    const params = {
      cmd: 'process_bulk',
      resource_type: this.name,
      bulk_select: 1,
      'bulk_export.x': 1,
      ['bulk_selected:' + id]: 1,
    };
    return this.httpPost(params, {transform: DefaultTransform});
  }

  getElementFromRoot(root) {
    throw new Error('getElementFromRoot not implemented in ' +
      this.constructor.name);
  }
}

export default EntityCommand;

// vim: set ts=2 sw=2 tw=80:
