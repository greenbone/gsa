/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import actionFunction from 'web/entity/hooks/actionFunction';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import RoleDialog from 'web/pages/roles/Dialog';
import {
  loadAllEntities as loadAllGroups,
  selector as groupSelector,
} from 'web/store/entities/groups';
import {
  loadAllEntities as loadAllUsers,
  selector as userSelector,
} from 'web/store/entities/users';
import PropTypes from 'web/utils/PropTypes';

const RoleComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onSaved,
  onSaveError,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const dispatch = useDispatch();

  const allUsers = useSelector(state => userSelector(state).getAllEntities());
  const allGroups = useSelector(state => groupSelector(state).getAllEntities());

  const dispatchLoadAllUsers = () => dispatch(loadAllUsers(gmp)());
  const dispatchLoadAllGroups = () => dispatch(loadAllGroups(gmp)());

  const [dialogVisible, setDialogVisible] = useState(false);
  const [error, setError] = useState(undefined);
  const [allPermissions, setAllPermissions] = useState(undefined);
  const [isCreatingPermission, setIsCreatingPermission] = useState(false);
  const [isCreatingSuperPermission, setIsCreatingSuperPermission] =
    useState(false);
  const [isInUse, setIsInUse] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [permissions, setPermissions] = useState(undefined);
  const [role, setRole] = useState(undefined);
  const [title, setTitle] = useState('');

  const openRoleDialog = role => {
    handleInteraction();

    dispatchLoadAllUsers();

    if (isDefined(role)) {
      loadSettings(role.id);

      setDialogVisible(true);
      setIsInUse(role.isInUse());
      setRole(role);
      setTitle(_('Edit Role {{name}}', role));
    } else {
      setAllPermissions(undefined);
      setDialogVisible(true);
      setPermissions(undefined);
      setRole(undefined);
      setIsInUse(false);
      setTitle(_('New Role'));
    }
  };

  const closeRoleDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseRoleDialog = () => {
    closeRoleDialog();
    handleInteraction();
  };

  const handleCreateSuperPermission = ({roleId, groupId}) => {
    handleInteraction();

    setIsCreatingSuperPermission(true);

    return gmp.permission
      .create({
        name: 'Super',
        resourceType: 'group',
        resourceId: groupId,
        roleId,
        subjectType: 'role',
      })
      .then(
        () => loadSettings(roleId),
        error => setError(error.message),
      )
      .then(() => setIsCreatingSuperPermission(false));
  };

  const handleCreatePermission = ({roleId, name}) => {
    handleInteraction();

    setIsCreatingPermission(true);

    return gmp.permission
      .create({
        name,
        roleId,
        subjectType: 'role',
      })
      .then(
        () => loadSettings(roleId),
        error => setError(error.message),
      )
      .then(() => setIsCreatingPermission(false));
  };

  const handleDeletePermission = ({roleId, permissionId}) => {
    handleInteraction();

    return actionFunction(gmp.permission.delete({id: permissionId}), {
      onSuccess: () => loadSettings(roleId),
      onError: error => setError(error.message),
      successMessage: _('Permission deleted successfully.'),
    });
  };

  const handleErrorClose = () => {
    setError(undefined);
  };

  const loadSettings = roleId => {
    if (capabilities.mayAccess('groups')) {
      dispatchLoadAllGroups();
    }

    if (capabilities.mayAccess('permissions')) {
      setIsLoadingPermissions(true);

      gmp.permissions
        .getAll({
          filter: Filter.fromString(
            `subject_type=role and subject_uuid=${roleId}`,
          ),
        })
        .then(response => {
          const allPermissions = [];
          const {data: permissions = []} = response;

          const perm_names = new Set(
            permissions
              .filter(perm => !isDefined(perm.resource))
              .map(perm => perm.name),
          );

          for (const cap of capabilities) {
            if (cap !== 'get_version' && !perm_names.has(cap)) {
              allPermissions.push(cap);
            }
          }

          setPermissions(permissions);
          setAllPermissions(allPermissions);
        })
        .catch(error => setError(error.message))
        .then(() => setIsLoadingPermissions(false));
    }
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  return (
    <EntityComponent
      name="role"
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
            create: openRoleDialog,
            edit: openRoleDialog,
          })}
          {dialogVisible && (
            <RoleDialog
              allGroups={allGroups}
              allPermissions={allPermissions}
              allUsers={allUsers}
              error={error}
              isCreatingPermission={isCreatingPermission}
              isCreatingSuperPermission={isCreatingSuperPermission}
              isInUse={isInUse}
              isLoadingPermissions={isLoadingPermissions}
              permissions={permissions}
              role={role}
              title={title}
              onClose={handleCloseRoleDialog}
              onCreatePermission={handleCreatePermission}
              onCreateSuperPermission={handleCreateSuperPermission}
              onDeletePermission={handleDeletePermission}
              onErrorClose={handleErrorClose}
              onSave={d => {
                handleInteraction();
                return save(d)
                  .then(() => closeRoleDialog())
                  .catch(e => setError(e.message));
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

RoleComponent.propTypes = {
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

export default RoleComponent;
