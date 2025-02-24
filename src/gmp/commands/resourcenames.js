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

  getCollectionListFromRoot(root, meta) {
    const response = this.getEntitiesResponse(root);
    const res = parseCollectionList(response, this.name, this.clazz, {
      entities_parse_func: this.parseResourceNamesEntities,
    });
    return res;
  }

  export(entities) {
    throw new Error('export not implemented in ' + this.constructor.name);
  }

  exportByIds(ids) {
    throw new Error('exportByIds not implemented in ' + this.constructor.name);
  }

  exportByFilter(filter) {
    throw new Error(
      'exportByFilter not implemented in ' + this.constructor.name,
    );
  }

  delete(entities, extraParams) {
    throw new Error('delete not implemented in ' + this.constructor.name);
  }

  deleteByIds(ids, extraParams = {}) {
    throw new Error('deleteByIds not implemented in ' + this.constructor.name);
  }

  deleteByFilter(filter, extraParams) {
    throw new Error(
      'deleteByFilter not implemented in ' + this.constructor.name,
    );
  }

  transformAggregates(response) {
    throw new Error(
      'transformAggregates not implemented in ' + this.constructor.name,
    );
  }

  getAggregates({
    dataColumns = [],
    textColumns = [],
    sort = [],
    aggregateMode,
    maxGroups,
    subgroupColumn,
    ...params
  } = {}) {
    throw new Error(
      'getAggregates not implemented in ' + this.constructor.name,
    );
  }
}

registerCommand('resourcenames', ResourceNamesCommand);
