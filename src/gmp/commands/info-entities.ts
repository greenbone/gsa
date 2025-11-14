/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  parseCollectionList,
  parseInfoEntities,
  parseInfoCounts,
  type ModelClass,
  type InfoEntitiesFilterFunc,
  type InfoElement,
} from 'gmp/collection/parser';
import EntitiesCommand from 'gmp/commands/entities';
import {type InfoType} from 'gmp/commands/info-entity';
import type Http from 'gmp/http/http';
import {type default as Model, type Element} from 'gmp/models/model';

class InfoEntitiesCommand<
  TModel extends Model,
> extends EntitiesCommand<TModel> {
  private readonly entitiesFilterFunc: InfoEntitiesFilterFunc;

  constructor(
    http: Http,
    infoType: InfoType,
    model: ModelClass<TModel>,
    entitiesFilterFunc: InfoEntitiesFilterFunc,
  ) {
    super(http, 'info', model);
    this.setDefaultParam('cmd', 'get_info');
    this.setDefaultParam('info_type', infoType);
    this.entitiesFilterFunc = entitiesFilterFunc;

    this.parseInfoEntities = this.parseInfoEntities.bind(this);
  }

  getEntitiesResponse(root) {
    return root.get_info.get_info_response;
  }

  parseInfoEntities(
    response: InfoElement,
    name: string,
    modelClass: ModelClass<TModel>,
  ) {
    return parseInfoEntities<TModel>(
      response,
      name,
      modelClass,
      this.entitiesFilterFunc,
    );
  }

  getCollectionListFromRoot(root: Element) {
    const response = this.getEntitiesResponse(root);
    return parseCollectionList<TModel>(response, this.name, this.clazz, {
      entitiesParseFunc: this.parseInfoEntities,
      collectionCountParseFunc: parseInfoCounts,
    });
  }
}

export default InfoEntitiesCommand;
