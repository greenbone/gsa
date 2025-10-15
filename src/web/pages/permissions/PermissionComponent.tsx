/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import type Rejection from 'gmp/http/rejection';
import type Group from 'gmp/models/group';
import {
  type default as Permission,
  type SubjectType,
} from 'gmp/models/permission';
import type Role from 'gmp/models/role';
import type User from 'gmp/models/user';
import {type EntityType, getEntityType} from 'gmp/utils/entitytype';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import {type GotoDetailsFunc} from 'web/entity/navigation';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PermissionDialog from 'web/pages/permissions/PermissionDialog';

interface PermissionComponentRenderProps {
  create: (permission?: Permission, fixed?: boolean) => void;
  edit: (permission: Permission, fixed?: boolean) => void;
  clone: (permission: Permission) => void;
  delete: (permission: Permission) => Promise<void>;
  download: (permission: Permission) => void;
}

interface PermissionComponentProps {
  children: (props: PermissionComponentRenderProps) => React.ReactNode;
  onCloneError?: (error: Rejection) => void;
  onCloned?: GotoDetailsFunc;
  onCreateError?: (error: Rejection) => void;
  onCreated?: GotoDetailsFunc;
  onDeleteError?: (error: Rejection) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Rejection) => void;
  onDownloaded?: OnDownloadedFunc;
  onSaveError?: (error: Rejection) => void;
  onSaved?: () => void;
}

interface PermissionState {
  id?: string;
  name?: string;
  comment?: string;
  permission?: Permission;
  resourceId?: string;
  resourceName?: string;
  resourceType?: EntityType;
  subjectType?: SubjectType;
  userId?: string;
  roleId?: string;
  groupId?: string;
  title?: string;
}

const PermissionsComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onSaved,
  onSaveError,
}: PermissionComponentProps) => {
  const capabilities = useCapabilities();
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const [id, setId] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const [permission, setPermission] = useState<Permission | undefined>();

  const [resourceId, setResourceId] = useState<string | undefined>();
  const [resourceName, setResourceName] = useState<string | undefined>();
  const [resourceType, setResourceType] = useState<EntityType | undefined>();
  const [fixedResource, setFixedResource] = useState<boolean>(false);

  const [subjectType, setSubjectType] = useState<SubjectType | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [roleId, setRoleId] = useState<string | undefined>();
  const [groupId, setGroupId] = useState<string | undefined>();

  const [users, setUsers] = useState<User[] | undefined>();
  const [roles, setRoles] = useState<Role[] | undefined>();
  const [groups, setGroups] = useState<Group[] | undefined>();

  const [title, setTitle] = useState<string | undefined>();

  const closePermissionDialog = () => {
    setDialogVisible(false);
  };

  const handleClosePermissionDialog = () => {
    closePermissionDialog();
  };

  const openPermissionDialog = async (
    permissionEntity?: Permission,
    fixed = false,
  ) => {
    let permState: PermissionState = {};
    let opts: {title?: string} = {};

    if (isDefined(permissionEntity)) {
      const subjectTypeValue = isDefined(permissionEntity.subject)
        ? (getEntityType(permissionEntity.subject) as SubjectType)
        : undefined;

      permState = {
        id: permissionEntity.id,
        name: permissionEntity.name,
        comment: permissionEntity.comment,
        groupId: undefined,
        permission: permissionEntity,
        resourceId: isDefined(permissionEntity.resource)
          ? permissionEntity.resource.id
          : '',
        resourceName: isDefined(permissionEntity.resource)
          ? permissionEntity.resource.name
          : '',
        resourceType: isDefined(permissionEntity.resource)
          ? getEntityType(permissionEntity.resource)
          : undefined,
        roleId: undefined,
        subjectType: subjectTypeValue,
        title: _('Edit Permission {{name}}', {
          name: permissionEntity.name || '',
        }),
        userId: undefined,
      };

      switch (subjectTypeValue) {
        case 'user':
          if (isDefined(permissionEntity.subject)) {
            permState.userId = permissionEntity.subject.id;
          }
          break;
        case 'role':
          if (isDefined(permissionEntity.subject)) {
            permState.roleId = permissionEntity.subject.id;
          }
          break;
        case 'group':
          if (isDefined(permissionEntity.subject)) {
            permState.groupId = permissionEntity.subject.id;
          }
          break;
        default:
          break;
      }
      opts = {
        title: _('Edit permission {{name}}', {
          name: shorten(permissionEntity.name || ''),
        }),
      };
    } else {
      permState = {
        comment: undefined,
        id: undefined,
        name: undefined,
        resourceId: undefined,
        resourceName: undefined,
        resourceType: undefined,
        subjectType: undefined,
        userId: undefined,
        groupId: undefined,
        roleId: undefined,
        title: undefined,
      };
    }

    setId(permState.id);
    setName(permState.name);
    setComment(permState.comment);
    setPermission(permState.permission);
    setResourceId(permState.resourceId);
    setResourceName(permState.resourceName);
    setResourceType(permState.resourceType);
    setSubjectType(permState.subjectType);
    setUserId(permState.userId);
    setRoleId(permState.roleId);
    setGroupId(permState.groupId);
    setTitle(opts.title || permState.title);
    setFixedResource(fixed);
    setDialogVisible(true);

    if (capabilities.mayAccess('user')) {
      if (!isDefined(permState.subjectType)) {
        setSubjectType('user');
      }

      const response = await gmp.users.getAll();
      const {data: usersData} = response;
      setUserId(selectSaveId(usersData, permState.userId));
      setUsers(usersData);
    }

    if (capabilities.mayAccess('role')) {
      if (
        !capabilities.mayAccess('user') &&
        !isDefined(permState.subjectType)
      ) {
        setSubjectType('role');
      }

      const response = await gmp.roles.getAll();
      const {data: rolesData} = response;
      setRoleId(selectSaveId(rolesData, permState.roleId));
      setRoles(rolesData);
    }

    if (capabilities.mayAccess('group')) {
      if (
        !capabilities.mayAccess('user') &&
        !capabilities.mayAccess('role') &&
        !isDefined(permState.subjectType)
      ) {
        setSubjectType('group');
      }

      // @ts-expect-error
      const response = await gmp.groups.getAll();
      const {data: groupsData} = response;
      setGroupId(selectSaveId(groupsData, permState.groupId));
      setGroups(groupsData);
    }
  };

  return (
    <EntityComponent
      name="permission"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
        <>
          {children({
            ...other,
            create: openPermissionDialog,
            edit: openPermissionDialog,
          })}
          {dialogVisible && (
            <PermissionDialog
              comment={comment}
              fixedResource={fixedResource}
              groupId={groupId}
              groups={groups}
              id={id}
              name={name}
              permission={permission}
              resourceId={resourceId}
              resourceName={resourceName}
              resourceType={resourceType}
              roleId={roleId}
              roles={roles}
              subjectType={subjectType}
              title={title}
              userId={userId}
              users={users}
              onClose={handleClosePermissionDialog}
              onSave={d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closePermissionDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

export default PermissionsComponent;
