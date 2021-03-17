/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {connect} from 'react-redux';

import {_} from 'gmp/locale/lang';

import {ALL_FILTER} from 'gmp/models/filter';
import {TICKET_STATUS} from 'gmp/models/ticket';

import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import {
  loadEntities as loadUsers,
  selector as usersSelector,
} from 'web/store/entities/users';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import CreateTicketDialog from './createdialog';
import EditTicketDialog from './editdialog';

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
    const {
      createDialogVisible,
      editDialogVisible,
      result,
      ticket,
      userId,
    } = this.state;
    return (
      <EntityComponent
        name="ticket"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
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
                onUserIdChange={this.handleUserIdChange}
                onClose={this.handleCloseCreateDialog}
                onSave={d => {
                  this.handleInteraction();
                  return create(d).then(this.handleCloseCreateDialog);
                }}
              />
            )}
            {editDialogVisible && (
              <EditTicketDialog
                status={
                  ticket.status === TICKET_STATUS.verified
                    ? TICKET_STATUS.closed
                    : ticket.status
                }
                openNote={ticket.openNote}
                fixedNote={ticket.fixedNote}
                closedNote={ticket.closedNote}
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
                  userId, // eslint-disable-line no-shadow
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

// vim: set ts=2 sw=2 tw=80:
