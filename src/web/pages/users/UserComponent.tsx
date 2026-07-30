/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {type EntityActionData} from 'gmp/commands/entity';
import type Model from 'gmp/models/model';
import type Settings from 'gmp/models/settings';
import type User from 'gmp/models/user';
import {isDefined} from 'gmp/utils/identity';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import {
  useCloneUser,
  useCreateUser,
  useDeleteUser,
  useSaveUser,
} from 'web/hooks/use-query/users';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import UserDialog, {type UserDialogSaveData} from 'web/pages/users/UsersDialog';

interface UserComponentRenderProps {
  clone: (entity: User) => Promise<void>;
  create: () => Promise<void>;
  delete: (entity: User) => Promise<void>;
  download: (entity: User) => Promise<void>;
  edit: (user: User) => Promise<void>;
  save: (data: UserDialogSaveData) => Promise<void>;
}

interface UserComponentProps {
  children: (props: UserComponentRenderProps) => ReactNode;
  onCloneError?: (error: Error) => void;
  onCloned?: (response: EntityActionData) => void;
  onCreateError?: (error: Error) => void;
  onCreated?: (response: EntityActionData) => void;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onSaveError?: (error: Error) => void;
  onSaved?: () => void;
}

const UserComponent = ({
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
}: UserComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [accessHosts, setAccessHosts] = useState<string>();
  const [comment, setComment] = useState<string>();
  const [groupIds, setGroupIds] = useState<string[]>();
  const [groups, setGroups] = useState<Model[]>();
  const [hostsAllow, setHostsAllow] = useState<string>();
  const [name, setName] = useState<string>();
  const [oldName, setOldName] = useState<string>();
  const [roleIds, setRoleIds] = useState<string[]>();
  const [roles, setRoles] = useState<Model[]>();
  const [settings, setSettings] = useState<Settings>();
  const [title, setTitle] = useState<string>();
  const [user, setUser] = useState<User>();

  const createMutation = useCreateUser({
    onSuccess: onCreated,
    onError: onCreateError,
  });
  const saveMutation = useSaveUser({
    onSuccess: onSaved,
    onError: onSaveError,
  });
  const cloneMutation = useCloneUser({
    onSuccess: onCloned,
    onError: onCloneError,
  });
  const deleteMutation = useDeleteUser({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });
  const downloadUser = useEntityDownload<User>(
    entity => gmp.user.export(entity),
    {
      onDownloaded,
      onDownloadError,
    },
  );

  const closeUserDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseUserDialog = () => {
    closeUserDialog();
  };

  const openUserDialog = async (user?: User) => {
    try {
      const [groupsResponse, rolesResponse, authSettingsResponse] =
        await Promise.all([
          gmp.groups.getAll({
            filter: 'permission=modify_group', //  list only groups current user may modify
          }),
          gmp.roles.getAll(),
          gmp.user.currentAuthSettings(),
        ]);

      setGroups(groupsResponse.data);
      setRoles(rolesResponse.data);

      const settings = authSettingsResponse.data;
      setSettings(settings);
      setDialogVisible(true);

      if (isDefined(user)) {
        const newGroupIds = user.groups.map(group => group.id);
        const newRoleIds = user.roles.map(role => role.id);

        setAccessHosts(user.hosts?.addresses.join(', ') ?? '');
        setComment(user.comment);
        setGroupIds(newGroupIds);
        setHostsAllow(user.hosts?.allow);
        setName(user.name);
        setOldName(user.name);
        setRoleIds(newRoleIds);
        setTitle(_('Edit User {{- name}}', {name: user.name ?? ''}));
        setUser(user);
      } else {
        setAccessHosts(undefined);
        setComment(undefined);
        setGroupIds(undefined);
        setHostsAllow(undefined);
        setName(undefined);
        setOldName(undefined);
        setRoleIds(undefined);
        setTitle(undefined);
        setUser(undefined);
      }
    } catch (error) {
      console.error('Error loading user dialog data:', error);
    }
  };

  const saveUser = async (data: UserDialogSaveData) => {
    await saveMutation.mutateAsync({...data, id: data.id as string});
  };

  const cloneUser = async (entity: User) => {
    await cloneMutation.mutateAsync({id: entity.id});
  };

  const deleteUser = async (entity: User) => {
    await deleteMutation.mutateAsync({id: entity.id});
  };

  const downloadUserEntity = async (entity: User) => {
    await downloadUser(entity);
  };

  const handleUserDialogSave = async (data: UserDialogSaveData) => {
    if (isDefined(data.id)) {
      await saveUser(data);
    } else {
      await createMutation.mutateAsync(data);
    }

    closeUserDialog();
  };

  return (
    <>
      {children({
        clone: cloneUser,
        create: openUserDialog,
        delete: deleteUser,
        download: downloadUserEntity,
        edit: openUserDialog,
        save: saveUser,
      })}
      {dialogVisible && isDefined(settings) && (
        <UserDialog
          accessHosts={accessHosts}
          comment={comment}
          groupIds={groupIds}
          groups={groups}
          hostsAllow={hostsAllow}
          name={name}
          oldName={oldName}
          roleIds={roleIds}
          roles={roles}
          settings={settings}
          title={title}
          user={user}
          onClose={handleCloseUserDialog}
          onSave={handleUserDialogSave}
        />
      )}
    </>
  );
};

export default UserComponent;
