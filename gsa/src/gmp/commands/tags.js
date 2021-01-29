/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import Tag from 'gmp/models/tag';

import {apiType} from 'gmp/utils/entitytype';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.tags');

export class TagCommand extends EntityCommand {
  constructor(http) {
    super(http, 'tag', Tag);
  }

  getElementFromRoot(root) {
    return root.get_tag.get_tags_response.tag;
  }

  create({
    name,
    comment = '',
    active,
    resource_id = '',
    resource_ids = [resource_id],
    resource_type,
    resources_action,
    value = '',
  }) {
    const data = {
      cmd: 'create_tag',
      tag_name: name,
      tag_value: value,
      active,
      comment,
      'resource_ids:': resource_ids,
      resource_type: apiType(resource_type),
      resources_action,
    };
    log.debug('Creating new tag', data);
    return this.action(data);
  }

  save({
    id,
    name,
    comment = '',
    active,
    filter,
    resource_id = '',
    resource_ids = [resource_id],
    resource_type,
    resources_action,
    value = '',
  }) {
    const data = {
      cmd: 'save_tag',
      id,
      tag_name: name,
      tag_value: value,
      comment,
      active,
      filter,
      'resource_ids:': resource_ids.length > 0 ? resource_ids : undefined,
      resource_type: apiType(resource_type),
      resources_action,
    };
    log.debug('Saving tag', data);
    return this.action(data);
  }

  enable({id}) {
    const data = {
      cmd: 'toggle_tag',
      enable: '1',
      id,
    };
    log.debug('Enabling tag', data);
    return this.httpPost(data);
  }

  disable({id}) {
    const data = {
      cmd: 'toggle_tag',
      enable: '0',
      id,
    };
    log.debug('Disabling tag', data);
    return this.httpPost(data);
  }
}

export class TagsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'tag', Tag);
  }

  getEntitiesResponse(root) {
    return root.get_tags.get_tags_response;
  }
}

registerCommand('tag', TagCommand);
registerCommand('tags', TagsCommand);

// vim: set ts=2 sw=2 tw=80:
