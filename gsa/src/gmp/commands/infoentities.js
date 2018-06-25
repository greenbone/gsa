/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {
  parse_collection_list,
  parse_info_entities,
  parse_info_counts,
} from '../collection/parser.js';

import EntitiesCommand from './entities.js';

class InfoEntitiesCommand extends EntitiesCommand {

  constructor(http, name, clazz, entities_filter_func) {
    super(http, 'info', clazz);
    this.setParam('cmd', 'get_info');
    this.setParam('info_type', name);
    this.entities_filter_func = entities_filter_func;

    this.parseInfoEntities = this.parseInfoEntities.bind(this);
  }

  getEntitiesResponse(root) {
    return root.get_info.get_info_response;
  }

  parseInfoEntities(response, name, modelclass) {
    return parse_info_entities(response, name, modelclass,
      this.entities_filter_func);
  }

  getCollectionListFromRoot(root, meta) {
    const response = this.getEntitiesResponse(root);
    return parse_collection_list(response, this.name, this.clazz, {
      meta,
      entities_parse_func: this.parseInfoEntities,
      collection_count_parse_func: parse_info_counts,
    });
  }
}

export default InfoEntitiesCommand;

// vim: set ts=2 sw=2 tw=80:
