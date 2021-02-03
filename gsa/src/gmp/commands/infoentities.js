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

// vim: set ts=2 sw=2 tw=80:
