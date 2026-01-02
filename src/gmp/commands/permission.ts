/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import {type Element} from 'gmp/models/model';
import Permission, {type PermissionElement} from 'gmp/models/permission';
import {type ApiType, apiType, type EntityType} from 'gmp/utils/entity-type';

export interface PermissionCommandCreateParams {
  name: string;
  comment?: string;
  groupId?: string;
  roleId?: string;
  userId?: string;
  resourceId?: string;
  resourceType?: EntityType | ApiType;
  subjectType?: EntityType | ApiType;
}

export interface PermissionCommandSaveParams extends PermissionCommandCreateParams {
  id: string;
}

const log = logger.getLogger('gmp.commands.permission');

class PermissionCommand extends EntityCommand<Permission, PermissionElement> {
  constructor(http: Http) {
    super(http, 'permission', Permission);
  }

  getElementFromRoot(root: Element): PermissionElement {
    // @ts-expect-error
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
  }: PermissionCommandCreateParams) {
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
    return this.entityAction(data);
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
  }: PermissionCommandSaveParams) {
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
      subject_type: apiType(subjectType),
      id_or_empty: resourceId,
    };
    log.debug('Saving permission', data);
    return this.entityAction(data);
  }
}

export default PermissionCommand;
