/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import Permission from '../models/permission';

import {apiType} from '../utils/entitytype';

const log = logger.getLogger('gmp.commands.permissions');

class PermissionCommand extends EntityCommand {

  constructor(http) {
    super(http, 'permission', Permission);
  }

  getElementFromRoot(root) {
    return root.get_permission.get_permissions_response.permission;
  }

  create({
    name,
    comment = '',
    group_id,
    role_id,
    user_id,
    resource_id,
    resource_type,
    subject_type,
  }) {
    const data = {
      cmd: 'create_permission',
      comment,
      permission: name,
      permission_group_id: group_id,
      permission_role_id: role_id,
      permission_user_id: user_id,
      optional_resource_type: apiType(resource_type),
      id_or_empty: resource_id,
      subject_type: apiType(subject_type),
    };
    log.debug('Creating new permission', data);
    return this.action(data);
  }

  save({
    id,
    name,
    comment = '',
    group_id,
    role_id,
    user_id,
    resource_id,
    resource_type,
    subject_type,
  }) {
    const data = {
      cmd: 'save_permission',
      id,
      comment,
      permission: name,
      group_id,
      role_id,
      user_id,
      resource_id,
      optional_resource_type: apiType(resource_type),
      subject_type,
      id_or_empty: resource_id,
    };
    log.debug('Saving permission', data);
    return this.action(data);
  }
}

class PermissionsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'permission', Permission);
  }

  create({
    id,
    permission,
    entityType,
    comment = '',
    groupId,
    roleId,
    userId,
    subjectType,
    includeRelated,
    related = [],
  }) {
    const data = {
      cmd: 'create_permissions',
      comment,
      permission,
      permission_group_id: groupId,
      permission_role_id: roleId,
      permission_user_id: userId,
      resource_id: id,
      resource_type: apiType(entityType),
      include_related: includeRelated,
      subject_type: subjectType,
    };

    for (const resource in related) {
      data['related:' + resource.id] = resource.name;
    }

    log.debug('Creating new permission', data);
    return this.httpPost(data);
  }

  getEntitiesResponse(root) {
    return root.get_permissions.get_permissions_response;
  }
}

register_command('permission', PermissionCommand);
register_command('permissions', PermissionsCommand);

// vim: set ts=2 sw=2 tw=80:
