/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import {ALL_FILTER} from 'gmp/models/filter';
import {TICKET_STATUS} from 'gmp/models/ticket';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import CreateTicketDialog from 'web/pages/tickets/CreateDialog';
import EditTicketDialog from 'web/pages/tickets/EditDialog';
import {
  loadEntities as loadUsers,
  selector as usersSelector,
} from 'web/store/entities/users';
import PropTypes from 'web/utils/PropTypes';

const TicketComponent = ({
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
  const gmp = useGmp();
  const dispatch = useDispatch();

  const users = useSelector(state => {
    const select = usersSelector(state);
    return select.getEntities(ALL_FILTER);
  });

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  const [result, setResult] = useState();
  const [ticket, setTicket] = useState();
  const [userId, setUserId] = useState();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleOpenCreateDialog = resultData => {
    dispatch(loadUsers(gmp)(ALL_FILTER));

    setResult(resultData);
    setCreateDialogVisible(true);

    handleInteraction();
  };

  const handleCloseCreateDialog = () => {
    setUserId(undefined);
    setCreateDialogVisible(false);

    handleInteraction();
  };

  const handleOpenEditDialog = ticketData => {
    dispatch(loadUsers(gmp)(ALL_FILTER));

    setTicket(ticketData);
    setEditDialogVisible(true);

    handleInteraction();
  };

  const closeEditDialog = () => {
    setEditDialogVisible(false);
    setTicket(undefined);
  };

  const handleCloseEditDialog = () => {
    closeEditDialog();

    handleInteraction();
  };

  const handleOpenSolvedDialog = ticketData => {
    dispatch(loadUsers(gmp)(ALL_FILTER));

    setTicket({
      ...ticketData,
      status: TICKET_STATUS.fixed,
    });
    setEditDialogVisible(true);

    handleInteraction();
  };

  const handleOpenClosedDialog = ticketData => {
    dispatch(loadUsers(gmp)(ALL_FILTER));

    setTicket({
      ...ticketData,
      status: TICKET_STATUS.closed,
    });
    setEditDialogVisible(true);

    handleInteraction();
  };

  const handleUserIdChange = id => {
    setUserId(id);
  };

  return (
    <EntityComponent
      name="ticket"
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
      {({create, save, ...other}) => (
        <>
          {children({
            ...other,
            createFromResult: handleOpenCreateDialog,
            solve: handleOpenSolvedDialog,
            close: handleOpenClosedDialog,
            edit: handleOpenEditDialog,
          })}
          {createDialogVisible && (
            <CreateTicketDialog
              resultId={result.id}
              title={_('Create new Ticket for Result {{- name}}', result)}
              userId={isDefined(userId) ? userId : selectSaveId(users)}
              users={users}
              onClose={handleCloseCreateDialog}
              onSave={d => {
                handleInteraction();
                return create(d).then(handleCloseCreateDialog);
              }}
              onUserIdChange={handleUserIdChange}
            />
          )}
          {editDialogVisible && (
            <EditTicketDialog
              closedNote={ticket.closedNote}
              fixedNote={ticket.fixedNote}
              openNote={ticket.openNote}
              status={
                ticket.status === TICKET_STATUS.verified
                  ? TICKET_STATUS.closed
                  : ticket.status
              }
              ticketId={ticket.id}
              title={_('Edit Ticket {{- name}}', ticket)}
              userId={ticket.assignedTo.user.id}
              users={users}
              onClose={handleCloseEditDialog}
              onSave={({
                openNote,
                fixedNote,
                closedNote,
                status,
                ticketId,
                userId,
              }) => {
                handleInteraction();
                return save({
                  id: ticketId,
                  openNote,
                  fixedNote,
                  closedNote,
                  status,
                  userId,
                }).then(closeEditDialog);
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

TicketComponent.propTypes = {
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

export default TicketComponent;
