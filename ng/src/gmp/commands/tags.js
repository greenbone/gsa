/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from '../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Tag from '../models/tag.js';

const log = logger.getLogger('gmp.commands.tags');

class TagCommand extends EntityCommand {

  constructor(http) {
    super(http, 'tag', Tag);
  }

  getElementFromRoot(root) {
    // response does contain two get_tags_response elements
    return root.get_tag.get_tags_response[0].tag;
  }

  create({name, comment = '', active, resource_id = '', resource_type,
      value = ''}) {
    const data = {
      cmd: 'create_tag',
      tag_name: name,
      tag_value: value,
      active,
      comment,
      resource_id,
      resource_type,
      next: 'get_tag',
    };
    log.debug('Creating new tag', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  save({id, name, comment = '', active, resource_id = '', resource_type,
      value = ''}) {
    const data = {
      cmd: 'save_tag',
      id,
      tag_name: name,
      tag_value: value,
      comment,
      active,
      resource_id,
      resource_type,
      next: 'get_tag',
    };
    log.debug('Saving tag', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  enable({id}) {
    const data = {
      cmd: 'toggle_tag',
      enable: '1',
      id,
      next: 'get_tag',
    };
    log.debug('Enabling tag', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  disable({id}) {
    const data = {
      cmd: 'toggle_tag',
      enable: '0',
      id,
      next: 'get_tag',
    };
    log.debug('Disabling tag', data);
    return this.httpPost(data).then(this.transformResponse);
  }
}

class TagsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'tag', Tag);
  }

  getEntitiesResponse(root) {
    return root.get_tags.get_tags_response;
  }
}

register_command('tag', TagCommand);
register_command('tags', TagsCommand);

// vim: set ts=2 sw=2 tw=80:
