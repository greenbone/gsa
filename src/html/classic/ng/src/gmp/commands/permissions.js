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

import logger from '../../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Permission from '../models/permission.js';

const log = logger.getLogger('gmp.commands.permissions');

export class PermissionCommand extends EntityCommand {

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
      next: 'get_permission',
      permission: name,
      permission_group_id: group_id,
      permission_role_id: role_id,
      permission_user_id: user_id,
      optional_resource_type: resource_type,
      id_or_empty: resource_id,
      subject_type,
    };
    log.debug('Creating new permission', data);
    return this.httpPost(data).then(this.transformResponse);
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
      next: 'get_permission',
      id,
      comment,
      permission: name,
      group_id,
      role_id,
      user_id,
      resource_id,
      optional_resource_type: resource_type,
      subject_type,
      id_or_empty: resource_id,
    };
    log.debug('Saving permission', data);
    return this.httpPost(data).then(this.transformResponse);
  }
}

export class PermissionsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'permission', Permission);
  }

  getEntitiesResponse(root) {
    return root.get_permissions.get_permissions_response;
  }
}

register_command('permission', PermissionCommand);
register_command('permissions', PermissionsCommand);

// vim: set ts=2 sw=2 tw=80:
