/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import Permission from 'gmp/models/permission';

import {apiType} from 'gmp/utils/entitytype';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

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
    groupId,
    roleId,
    userId,
    resourceId,
    resourceType,
    subjectType,
  }) {
    if (resourceType === 'policy') {
      resourceType = 'config';
    } else if (resourceType === 'audit') {
      resourceType = 'task';
    }

    const data = {
      cmd: 'create_permission',
      comment,
      permission: name,
      permission_group_id: groupId,
      permission_role_id: roleId,
      permission_user_id: userId,
      optional_resource_type: apiType(resourceType),
      id_or_empty: resourceId,
      subject_type: apiType(subjectType),
    };
    log.debug('Creating new permission', data);
    return this.action(data);
  }

  save({
    id,
    name,
    comment = '',
    groupId,
    roleId,
    userId,
    resourceId,
    resourceType,
    subjectType,
  }) {
    const data = {
      cmd: 'save_permission',
      id,
      comment,
      permission: name,
      group_id: groupId,
      role_id: roleId,
      user_id: userId,
      resource_id: resourceId,
      optional_resource_type: apiType(resourceType),
      subject_type: subjectType,
      id_or_empty: resourceId,
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
    permission, // permission is read or write here
    entityType,
    comment = '',
    groupId,
    roleId,
    userId,
    subjectType,
    includeRelated,
    related = [],
  }) {
    if (entityType === 'policy') {
      entityType = 'config';
    } else if (entityType === 'audit') {
      entityType = 'task';
    }

    const data = {
      cmd: 'create_permissions',
      comment,
      permission_type: permission,
      permission_group_id: groupId,
      permission_role_id: roleId,
      permission_user_id: userId,
      resource_id: id,
      resource_type: apiType(entityType),
      include_related: includeRelated,
      subject_type: subjectType,
    };

    related.forEach(resource => {
      data['related:' + resource.id] = apiType(resource.entityType);
    });

    log.debug('Creating new permission', data);
    return this.httpPost(data);
  }

  getEntitiesResponse(root) {
    return root.get_permissions.get_permissions_response;
  }
}

registerCommand('permission', PermissionCommand);
registerCommand('permissions', PermissionsCommand);

// vim: set ts=2 sw=2 tw=80:
