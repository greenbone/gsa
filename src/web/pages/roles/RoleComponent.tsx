/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import type Rejection from 'gmp/http/rejection';
import Filter from 'gmp/models/filter';
import type Permission from 'gmp/models/permission';
import type Role from 'gmp/models/role';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import actionFunction from 'web/entity/hooks/actionFunction';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import {type GotoDetailsFunc} from 'web/entity/navigation';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import RoleDialog from 'web/pages/roles/RoleDialog';
import {
  loadAllEntities as loadAllGroups,
  selector as groupSelector,
} from 'web/store/entities/groups';
import {
  loadAllEntities as loadAllUsers,
  selector as userSelector,
} from 'web/store/entities/users';

interface CreatePermissionData {
  roleId: string;
  name: string;
}

interface CreateSuperPermissionData {
  roleId: string;
  groupId: string;
}

interface DeletePermissionData {
  roleId: string;
  permissionId: string;
}

interface RoleComponentRenderProps {
  create: (role?: Role) => void;
  edit: (role: Role) => void;
  clone: (role: Role) => void;
  delete: (role: Role) => Promise<void>;
  download: (role: Role) => void;
}

interface RoleComponentProps {
  children: (props: RoleComponentRenderProps) => React.ReactNode;
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
  onSaved,
  onSaveError,
}: RoleComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const dispatch = useDispatch();

  const allUsers = useSelector(state => userSelector(state).getAllEntities());
  const allGroups = useSelector(state => groupSelector(state).getAllEntities());

  // @ts-expect-error
  const dispatchLoadAllUsers = () => dispatch(loadAllUsers(gmp)());
  // @ts-expect-error
  const dispatchLoadAllGroups = () => dispatch(loadAllGroups(gmp)());

  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [error, setError] = useState<Rejection | undefined>(undefined);
  const [allPermissions, setAllPermissions] = useState<
    Array<string> | undefined
  >(undefined);
  const [isCreatingPermission, setIsCreatingPermission] =
    useState<boolean>(false);
  const [isCreatingSuperPermission, setIsCreatingSuperPermission] =
    useState<boolean>(false);
  const [isInUse, setIsInUse] = useState<boolean>(false);
  const [isLoadingPermissions, setIsLoadingPermissions] =
    useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[] | undefined>(
    undefined,
  );
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [title, setTitle] = useState<string>('');

  const openRoleDialog = (role?: Role) => {
    dispatchLoadAllUsers();

    if (isDefined(role?.id)) {
      void loadSettings(role.id);

      setDialogVisible(true);
      setIsInUse(role.isInUse());
      setRole(role);
      setTitle(_('Edit Role {{name}}', {name: role.name as string}));
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
  };

  const handleCreateSuperPermission = async ({
    roleId,
    groupId,
  }: CreateSuperPermissionData) => {
    setIsCreatingSuperPermission(true);

    try {
      // @ts-expect-error
      await gmp.permission.create({
        name: 'Super',
        resourceType: 'group',
        resourceId: groupId,
        roleId,
        subjectType: 'role',
      });
      await loadSettings(roleId);
    } catch (error) {
      setError(error as Rejection);
    } finally {
      setIsCreatingSuperPermission(false);
    }
  };

  const handleCreatePermission = async ({
    roleId,
    name,
  }: CreatePermissionData) => {
    setIsCreatingPermission(true);

    try {
      // @ts-expect-error
      await gmp.permission.create({
        name,
        roleId,
        subjectType: 'role',
      });
      await loadSettings(roleId);
    } catch (error) {
      setError(error as Rejection);
    } finally {
      setIsCreatingPermission(false);
    }
  };

  const handleDeletePermission = ({
    roleId,
    permissionId,
  }: DeletePermissionData): Promise<void> => {
    // @ts-expect-error
    return actionFunction(gmp.permission.delete({id: permissionId}), {
      onSuccess: () => loadSettings(roleId),
      onError: async error => setError(error as Rejection),
      successMessage: _('Permission deleted successfully.'),
    });
  };

  const handleErrorClose = () => {
    setError(undefined);
  };

  const loadSettings = async (roleId: string): Promise<void> => {
    if (capabilities.mayAccess('group')) {
      dispatchLoadAllGroups();
    }

    if (capabilities.mayAccess('permission')) {
      setIsLoadingPermissions(true);

      try {
        // @ts-expect-error
        const response = await gmp.permissions.getAll({
          filter: Filter.fromString(
            `subject_type=role and subject_uuid=${roleId}`,
          ),
        });

        const allPermissions: string[] = [];
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
      } catch (error) {
        setError(error as Rejection);
      } finally {
        setIsLoadingPermissions(false);
      }
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
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
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
              error={error?.message}
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
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeRoleDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

export default RoleComponent;
