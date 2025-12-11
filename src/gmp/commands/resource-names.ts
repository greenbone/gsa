/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type CollectionList,
  parseCollectionList,
  parseResourceNamesEntities,
} from 'gmp/collection/parser';
import {type EntitiesMeta} from 'gmp/commands/entities';
import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import Filter, {ALL_FILTER} from 'gmp/models/filter';
import ResourceName from 'gmp/models/resource-name';
import {resourceType, type EntityType} from 'gmp/utils/entity-type';
import {isDefined, isString} from 'gmp/utils/identity';

interface ResourceNamesGetParams {
  resourceType?: EntityType;
  filter?: Filter | string;
}

class ResourceNamesCommand extends HttpCommand {
  readonly name: string;
  readonly clazz: typeof ResourceName;

  constructor(http: Http) {
    super(http, {cmd: 'get_resource_names'});
    this.clazz = ResourceName;
    this.name = 'resource';
  }

  getEntitiesResponse(root) {
    return root.get_resource_names.get_resource_names_response;
  }

  parseResourceNamesEntities(response, name, modelClass) {
    return parseResourceNamesEntities(response, name, modelClass);
  }

  getCollectionListFromRoot(root): CollectionList<ResourceName> {
    const response = this.getEntitiesResponse(root);
    // @ts-expect-error
    const res = parseCollectionList<ResourceName>(
      response,
      this.name,
      ResourceName,
      {
        entitiesParseFunc: this.parseResourceNamesEntities,
      },
    );
    return res;
  }

  async get({
    filter,
    resourceType: resourceTypeValue,
  }: ResourceNamesGetParams = {}) {
    const response = await this.httpGetWithTransform({
      filter,
      resource_type: resourceType(resourceTypeValue),
    });
    const {
      entities,
      filter: collectionFilter,
      counts,
    } = this.getCollectionListFromRoot(response.data);
    return response.set<ResourceName[], EntitiesMeta>(entities, {
      filter: collectionFilter,
      counts,
    });
  }

  getAll(params: ResourceNamesGetParams = {}) {
    const {filter} = params;
    if (!isDefined(filter)) {
      params.filter = ALL_FILTER;
    } else if (isString(filter)) {
      params.filter = Filter.fromString(filter).all();
    } else {
      params.filter = (filter as Filter).all();
    }
    return this.get(params);
  }
}

export default ResourceNamesCommand;
