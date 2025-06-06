/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import GroupDialog from 'web/pages/groups/Dialog';
import PropTypes from 'web/utils/PropTypes';

const GroupComponent = ({
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

  const [dialogVisible, setDialogVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [group, setGroup] = useState(undefined);
  const [title, setTitle] = useState(undefined);

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const closeGroupDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseGroupDialog = () => {
    closeGroupDialog();
    handleInteraction();
  };

  const openGroupDialog = group => {
    handleInteraction();

    let usersList = [];
    gmp.users.getAll().then(response => {
      usersList = response.data;
      setAllUsers(usersList);
    });

    if (isDefined(group)) {
      const groupTitle = _('Edit Group {{name}}', group);

      setAllUsers(usersList);
      setDialogVisible(true);
      setGroup(group);
      setTitle(groupTitle);
    } else {
      setAllUsers(usersList);
      setDialogVisible(true);
      setGroup(group);
      setTitle(undefined);
    }
  };

  return (
    <EntityComponent
      name="group"
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
            create: openGroupDialog,
            edit: openGroupDialog,
          })}
          {dialogVisible && (
            <GroupDialog
              allUsers={allUsers}
              group={group}
              title={title}
              onClose={handleCloseGroupDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeGroupDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

GroupComponent.propTypes = {
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

export default GroupComponent;
