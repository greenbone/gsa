/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityCommandParams} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import type Filter from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import {type Element} from 'gmp/models/model';
import Tag, {type TagElement} from 'gmp/models/tag';
import {NO_VALUE, parseYesNo, YES_VALUE} from 'gmp/parser';
import {resourceType, type EntityType} from 'gmp/utils/entity-type';

interface TagCommandCreateParams {
  active: boolean;
  comment?: string;
  filter?: Filter | string;
  name: string;
  resourceIds?: string[];
  resourceType: EntityType;
  value?: string;
}

interface TagCommandSaveParams extends TagCommandCreateParams {
  id: string;
  resourcesAction?: 'add' | 'remove' | 'set';
}

const log = logger.getLogger('gmp.commands.tag');

class TagCommand extends EntityCommand<Tag, TagElement> {
  constructor(http: Http) {
    super(http, 'tag', Tag);
  }

  getElementFromRoot(root: Element): TagElement {
    // @ts-expect-error
    return root.get_tag.get_tags_response.tag;
  }

  create({
    active,
    comment = '',
    filter,
    name,
    resourceIds = [],
    resourceType: resourceTypeValue,
    value = '',
  }: TagCommandCreateParams) {
    const data = {
      cmd: 'create_tag',
      filter: filterString(filter),
      tag_name: name,
      tag_value: value,
      active: parseYesNo(active),
      comment,
      'resource_ids:': resourceIds.length > 0 ? resourceIds : undefined,
      resource_type: resourceType(resourceTypeValue),
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
    resourceIds = [],
    resourceType: resourceTypeValue,
    resourcesAction,
    value = '',
  }: TagCommandSaveParams) {
    const data = {
      cmd: 'save_tag',
      id,
      tag_name: name,
      tag_value: value,
      comment,
      active: parseYesNo(active),
      filter: filterString(filter),
      'resource_ids:': resourceIds.length > 0 ? resourceIds : undefined,
      resource_type: resourceType(resourceTypeValue),
      resources_action: resourcesAction,
    };
    log.debug('Saving tag', data);
    return this.action(data);
  }

  enable({id}: EntityCommandParams) {
    const data = {
      cmd: 'toggle_tag',
      enable: YES_VALUE,
      id,
    };
    log.debug('Enabling tag', data);
    return this.httpPostWithTransform(data);
  }

  disable({id}: EntityCommandParams) {
    const data = {
      cmd: 'toggle_tag',
      enable: NO_VALUE,
      id,
    };
    log.debug('Disabling tag', data);
    return this.httpPostWithTransform(data);
  }
}

export default TagCommand;
