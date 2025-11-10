/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import {type default as Model, type Element} from 'gmp/models/model';
import Permission, {type SubjectType} from 'gmp/models/permission';
import {apiType, type EntityType} from 'gmp/utils/entity-type';

export type PermissionType = 'read' | 'write';
export type IncludeRelatedType =
  | typeof INCLUDE_RELATED_CURRENT_RESOURCE_ONLY
  | typeof INCLUDE_RELATED_ALL_RESOURCES
  | typeof INCLUDE_RELATED_RESOURCES_ONLY;

export interface PermissionsCommandCreateParams {
  id: string;
  permission: PermissionType;
  entityType: EntityType;
  comment?: string;
  groupId?: string;
  roleId?: string;
  userId?: string;
  subjectType: SubjectType;
  includeRelated?: IncludeRelatedType;
  related?: Model[];
}

export const INCLUDE_RELATED_CURRENT_RESOURCE_ONLY = '0';
export const INCLUDE_RELATED_ALL_RESOURCES = '1';
export const INCLUDE_RELATED_RESOURCES_ONLY = '2';

const log = logger.getLogger('gmp.commands.permissions');

class PermissionsCommand extends EntitiesCommand<Permission> {
  constructor(http: Http) {
    super(http, 'permission', Permission);
  }

  async create({
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
  }: PermissionsCommandCreateParams) {
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
      subject_type: apiType(subjectType),
    };

    for (const resource of related) {
      data['related:' + resource.id] = apiType(resource.entityType);
    }
    log.debug('Creating new permission', data);
    await this.httpPostWithTransform(data);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_permissions.get_permissions_response;
  }
}

export default PermissionsCommand;
