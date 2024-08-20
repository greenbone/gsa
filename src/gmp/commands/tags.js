/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
