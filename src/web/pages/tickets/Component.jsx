/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import {ALL_FILTER} from 'gmp/models/filter';
import {TICKET_STATUS} from 'gmp/models/ticket';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import EntityComponent from 'web/entity/Component';
import {
  loadEntities as loadUsers,
  selector as usersSelector,
} from 'web/store/entities/users';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';

import CreateTicketDialog from './CreateDialog';
import EditTicketDialog from './EditDialog';

class TicketComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      createDialogVisible: false,
      editDialogVisible: false,
    };

    this.closeEditDialog = this.closeEditDialog.bind(this);

    this.handleCloseCreateDialog = this.handleCloseCreateDialog.bind(this);
    this.handleOpenCreateDialog = this.handleOpenCreateDialog.bind(this);
    this.handleCloseEditDialog = this.handleCloseEditDialog.bind(this);
    this.handleOpenEditDialog = this.handleOpenEditDialog.bind(this);

    this.handleUserIdChange = this.handleUserIdChange.bind(this);
  }

  handleOpenCreateDialog(result) {
    this.props.loadUsers();

    this.setState({
      result,
      createDialogVisible: true,
    });

    this.handleInteraction();
  }

  handleCloseCreateDialog() {
    this.setState({
      userId: undefined,
      createDialogVisible: false,
    });

    this.handleInteraction();
  }

  handleOpenEditDialog(ticket) {
    this.props.loadUsers();

    this.setState({
      ticket,
      editDialogVisible: true,
    });

    this.handleInteraction();
  }

  closeEditDialog() {
    this.setState({
      editDialogVisible: false,
      ticket: undefined,
    });
  }

  handleCloseEditDialog() {
    this.closeEditDialog();

    this.handleInteraction();
  }

  handleUserIdChange(userId) {
    this.setState({userId});
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
      users,
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
    } = this.props;
    const {createDialogVisible, editDialogVisible, result, ticket, userId} =
      this.state;
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
          <React.Fragment>
            {children({
              ...other,
              createFromResult: this.handleOpenCreateDialog,
              solve: this.handleOpenSolvedDialog,
              close: this.handleOpenClosedDialog,
              edit: this.handleOpenEditDialog,
            })}
            {createDialogVisible && (
              <CreateTicketDialog
                resultId={result.id}
                title={_('Create new Ticket for Result {{- name}}', result)}
                userId={isDefined(userId) ? userId : selectSaveId(users)}
                users={users}
                onClose={this.handleCloseCreateDialog}
                onSave={d => {
                  this.handleInteraction();
                  return create(d).then(this.handleCloseCreateDialog);
                }}
                onUserIdChange={this.handleUserIdChange}
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
                onClose={this.handleCloseEditDialog}
                onSave={({
                  openNote,
                  fixedNote,
                  closedNote,
                  status,
                  ticketId,
                  userId,
                }) => {
                  this.handleInteraction();
                  return save({
                    id: ticketId,
                    openNote,
                    fixedNote,
                    closedNote,
                    status,
                    userId,
                  }).then(this.closeEditDialog);
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

TicketComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  loadUsers: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.model),
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

const mapStateToProps = rootState => {
  const select = usersSelector(rootState);
  return {
    users: select.getEntities(ALL_FILTER),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadUsers: () => dispatch(loadUsers(gmp)(ALL_FILTER)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(TicketComponent);
