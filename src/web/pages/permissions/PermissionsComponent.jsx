/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {getEntityType} from 'gmp/utils/entitytype';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PermissionDialog from 'web/pages/permissions/Dialog';
import PropTypes from 'web/utils/PropTypes';

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
  onInteraction,
}) => {
  const capabilities = useCapabilities();
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);

  const [id, setId] = useState();
  const [name, setName] = useState();
  const [comment, setComment] = useState();
  const [permission, setPermission] = useState();

  const [resourceId, setResourceId] = useState();
  const [resourceName, setResourceName] = useState();
  const [resourceType, setResourceType] = useState();
  const [fixedResource, setFixedResource] = useState(false);

  const [subjectType, setSubjectType] = useState();
  const [userId, setUserId] = useState();
  const [roleId, setRoleId] = useState();
  const [groupId, setGroupId] = useState();

  const [users, setUsers] = useState();
  const [roles, setRoles] = useState();
  const [groups, setGroups] = useState();

  const [title, setTitle] = useState();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const closePermissionDialog = () => {
    setDialogVisible(false);
  };

  const handleClosePermissionDialog = () => {
    closePermissionDialog();
    handleInteraction();
  };

  const openPermissionDialog = (permissionEntity, fixed = false) => {
    let permState = {};
    let opts = {};

    if (isDefined(permissionEntity)) {
      const subjectTypeValue = isDefined(permissionEntity.subject)
        ? getEntityType(permissionEntity.subject)
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
          : '',
        roleId: undefined,
        subjectType: subjectTypeValue,
        title: _('Edit Permission {{name}}', {name: permissionEntity.name}),
        userId: undefined,
      };

      switch (subjectTypeValue) {
        case 'user':
          permState.userId = permissionEntity.subject.id;
          break;
        case 'role':
          permState.roleId = permissionEntity.subject.id;
          break;
        case 'group':
          permState.groupId = permissionEntity.subject.id;
          break;
        default:
          break;
      }
      opts = {
        title: _('Edit permission {{name}}', {
          name: shorten(permissionEntity.name),
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

    if (capabilities.mayAccess('users')) {
      if (!isDefined(permState.subjectType)) {
        setSubjectType('user');
      }

      gmp.users.getAll().then(response => {
        const {data: usersData} = response;
        setUserId(selectSaveId(usersData, permState.userId));
        setUsers(usersData);
      });
    }

    if (capabilities.mayAccess('roles')) {
      if (
        !capabilities.mayAccess('users') &&
        !isDefined(permState.subjectType)
      ) {
        setSubjectType('role');
      }

      gmp.roles.getAll().then(response => {
        const {data: rolesData} = response;
        setRoleId(selectSaveId(rolesData, permState.roleId));
        setRoles(rolesData);
      });
    }

    if (capabilities.mayAccess('groups')) {
      if (
        !capabilities.mayAccess('users') &&
        !capabilities.mayAccess('roles') &&
        !isDefined(permState.subjectType)
      ) {
        setSubjectType('group');
      }

      gmp.groups.getAll().then(response => {
        const {data: groupsData} = response;
        setGroupId(selectSaveId(groupsData, permState.groupId));
        setGroups(groupsData);
      });
    }

    handleInteraction();
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
      onInteraction={onInteraction}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, ...other}) => (
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
                handleInteraction();
                return save(d).then(() => closePermissionDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

PermissionsComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default PermissionsComponent;
