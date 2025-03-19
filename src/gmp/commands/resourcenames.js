/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  parseCollectionList,
  parseResourceNamesEntities,
} from 'gmp/collection/parser';
import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import ResourceName from 'gmp/models/resourcename';

export class ResourceNamesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'resource_name', ResourceName);
    this.name = 'resource';
  }

  getEntitiesResponse(root) {
    return root.get_resource_names.get_resource_names_response;
  }

  parseResourceNamesEntities(response, name, modelclass) {
    return parseResourceNamesEntities(response, name, modelclass);
  }

  getCollectionListFromRoot(root) {
    const response = this.getEntitiesResponse(root);
    const res = parseCollectionList(response, this.name, this.clazz, {
      entities_parse_func: this.parseResourceNamesEntities,
    });
    return res;
  }

  export() {
    throw new Error('export not implemented in ' + this.constructor.name);
  }

  exportByIds() {
    throw new Error('exportByIds not implemented in ' + this.constructor.name);
  }

  exportByFilter() {
    throw new Error(
      'exportByFilter not implemented in ' + this.constructor.name,
    );
  }

  delete() {
    throw new Error('delete not implemented in ' + this.constructor.name);
  }

  deleteByIds() {
    throw new Error('deleteByIds not implemented in ' + this.constructor.name);
  }

  deleteByFilter() {
    throw new Error(
      'deleteByFilter not implemented in ' + this.constructor.name,
    );
  }

  transformAggregates() {
    throw new Error(
      'transformAggregates not implemented in ' + this.constructor.name,
    );
  }

  getAggregates() {
    throw new Error(
      'getAggregates not implemented in ' + this.constructor.name,
    );
  }
}

registerCommand('resourcenames', ResourceNamesCommand);
