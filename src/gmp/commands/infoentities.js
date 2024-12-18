/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  parseCollectionList,
  parseInfoEntities,
  parseInfoCounts,
} from 'gmp/collection/parser';

import EntitiesCommand from './entities';

class InfoEntitiesCommand extends EntitiesCommand {
  constructor(http, name, clazz, entities_filter_func) {
    super(http, 'info', clazz);
    this.setDefaultParam('cmd', 'get_info');
    this.setDefaultParam('info_type', name);
    this.entities_filter_func = entities_filter_func;

    this.parseInfoEntities = this.parseInfoEntities.bind(this);
  }

  getEntitiesResponse(root) {
    return root.get_info.get_info_response;
  }

  parseInfoEntities(response, name, modelclass) {
    return parseInfoEntities(
      response,
      name,
      modelclass,
      this.entities_filter_func,
    );
  }

  getCollectionListFromRoot(root, meta) {
    const response = this.getEntitiesResponse(root);
    return parseCollectionList(response, this.name, this.clazz, {
      meta,
      entities_parse_func: this.parseInfoEntities,
      collection_count_parse_func: parseInfoCounts,
    });
  }
}

export default InfoEntitiesCommand;
