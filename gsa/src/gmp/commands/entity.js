/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import logger from 'gmp/log';

import DefaultTransform from 'gmp/http/transform/default';

import {isDefined} from 'gmp/utils/identity';

import GmpCommand, {BULK_SELECT_BY_IDS} from './gmp';

const log = logger.getLogger('gmp.commands.entity');

class EntityCommand extends GmpCommand {
  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name});

    this.clazz = clazz;
    this.name = name;
    this.id_name = name + '_id';

    this.transformResponse = this.transformResponse.bind(this);
  }

  getParams(params, extraParams, options) {
    const {id, ...other} = params;
    const rparams = super.getParams(other, extraParams, options);

    if (isDefined(id)) {
      rparams[this.id_name] = id;
    }
    return rparams;
  }

  getModelFromResponse(response) {
    return this.clazz.fromElement(this.getElementFromRoot(response.data));
  }

  transformResponse(response) {
    let entity = this.getModelFromResponse(response);
    if (!isDefined(entity.id)) {
      log.warn('Entity with undefined id found.'); // FIXME gsad MUST return 404 if no entity has been found
      entity = undefined;
    }
    return response.setData(entity);
  }

  get({id}, {filter, ...options} = {}) {
    return this.httpGet({id, filter}, options).then(this.transformResponse);
  }

  clone({id}) {
    const extraParams = {
      id, // we need plain 'id' in the submitted form data not 'xyz_id'
    };
    return this.action(
      {
        cmd: 'clone',
        resource_type: this.name,
      },
      {
        extraParams,
      },
    )
      .then(response => {
        log.debug('Cloned', this.name, id);
        return response;
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
    };
    return this.httpPost(params);
  }

  export({id}) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_IDS,
      ['bulk_selected:' + id]: 1,
    };
    return this.httpPost(params, {transform: DefaultTransform});
  }

  getElementFromRoot(root) {
    throw new Error(
      'getElementFromRoot not implemented in ' + this.constructor.name,
    );
  }
}

export default EntityCommand;

// vim: set ts=2 sw=2 tw=80:
