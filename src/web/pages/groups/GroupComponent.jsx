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

  onSaved,
  onSaveError,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [group, setGroup] = useState(undefined);
  const [title, setTitle] = useState(undefined);

  const closeGroupDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseGroupDialog = () => {
    closeGroupDialog();
  };

  const openGroupDialog = group => {
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
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
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
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeGroupDialog());
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default GroupComponent;
