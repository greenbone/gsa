/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DefaultTransform from 'gmp/http/transform/default';
import logger from 'gmp/log';
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
