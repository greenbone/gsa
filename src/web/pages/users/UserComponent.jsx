/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useState} from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import UserDialog from 'web/pages/users/Dialog';
import PropTypes from 'web/utils/PropTypes';

const UserComponent = props => {
  const {
    onInteraction,
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
  } = props;
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [accessHosts, setAccessHosts] = useState();
  const [comment, setComment] = useState();
  const [groupIds, setGroupIds] = useState();
  const [groups, setGroups] = useState();
  const [hostsAllow, setHostsAllow] = useState();
  const [name, setName] = useState();
  const [oldName, setOldName] = useState();
  const [roleIds, setRoleIds] = useState();
  const [roles, setRoles] = useState();
  const [settings, setSettings] = useState();
  const [title, setTitle] = useState();
  const [user, setUser] = useState();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const closeUserDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseUserDialog = () => {
    closeUserDialog();
    handleInteraction();
  };

  const openUserDialog = async user => {
    handleInteraction();

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

        setAccessHosts(user.hosts.addresses.join(', '));
        setComment(user.comment);
        setGroupIds(newGroupIds);
        setHostsAllow(user.hosts.allow);
        setName(user.name);
        setOldName(user.name);
        setRoleIds(newRoleIds);
        setTitle(_('Edit User {{name}}', user));
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

  return (
    <EntityComponent
      name="user"
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
            create: openUserDialog,
            edit: openUserDialog,
          })}
          {dialogVisible && (
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
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeUserDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

UserComponent.propTypes = {
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

export default UserComponent;
