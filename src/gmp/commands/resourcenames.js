/* Copyright (C) 2023 Greenbone AG
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

import registerCommand from 'gmp/command';

import ResourceName from 'gmp/models/resourcename';
import EntitiesCommand from './entities';

import {
  parseCollectionList,
  parseResourceNamesEntities,
} from 'gmp/collection/parser';

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

// vim: set ts=2 sw=2 tw=80:
