/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {connect} from 'react-redux';

import {_} from 'gmp/locale/lang';

import {ALL_FILTER} from 'gmp/models/filter';

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
import StatusChangeTicketDialog from './statuschangedialog';
import EditTicketDialog from './editdialog';

class TicketComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      createDialogVisible: false,
      solvedDialogVisible: false,
    };

    this.handleCloseCreateDialog = this.handleCloseCreateDialog.bind(this);
    this.handleOpenCreateDialog = this.handleOpenCreateDialog.bind(this);
    this.handleCloseEditDialog = this.handleCloseEditDialog.bind(this);
    this.handleOpenEditDialog = this.handleOpenEditDialog.bind(this);
    this.handleCloseSolvedDialog = this.handleCloseSolvedDialog.bind(this);
    this.handleOpenSolvedDialog = this.handleOpenSolvedDialog.bind(this);
    this.handleCloseClosedDialog = this.handleCloseClosedDialog.bind(this);
    this.handleOpenClosedDialog = this.handleOpenClosedDialog.bind(this);

    this.handleSolve = this.handleSolve.bind(this);
    this.handleClose = this.handleClose.bind(this);

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

  handleCloseEditDialog() {
    this.setState({
      ticket: undefined,
      editDialogVisible: false,
    });

    this.handleInteraction();
  }

  handleOpenSolvedDialog(ticket) {
    this.setState({
      ticket,
      solvedDialogVisible: true,
    });

    this.handleInteraction();
  }

  handleCloseSolvedDialog() {
    this.setState({
      ticket: undefined,
      solvedDialogVisible: false,
    });

    this.handleInteraction();
  }

  handleOpenClosedDialog(ticket) {
    this.setState({
      ticket,
      closedDialogVisible: true,
    });

    this.handleInteraction();
  }

  handleCloseClosedDialog() {
    this.setState({
      ticket: undefined,
      closedDialogVisible: false,
    });

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

  handleSolve({
    ticketId,
    comment,
  }) {
    const {
      gmp,
      onSolved,
      onSolveError,
    } = this.props;

    this.setState({solvedDialogVisible: false});

    return gmp.ticket.solve({id: ticketId, comment})
      .then(onSolved, onSolveError);
  }

  handleClose({
    ticketId,
    comment,
  }) {
    const {
      gmp,
      onClosed,
      onCloseError,
    } = this.props;

    this.setState({
      closedDialogVisible: false,
    });

    return gmp.ticket.close({id: ticketId, comment})
      .then(onClosed, onCloseError);
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
      closedDialogVisible,
      createDialogVisible,
      editDialogVisible,
      result,
      solvedDialogVisible,
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
        {({
          create,
          save,
          ...other
        }) => (
          <React.Fragment>
            {children({
              ...other,
              createFromResult: this.handleOpenCreateDialog,
              solve: this.handleOpenSolvedDialog,
              close: this.handleOpenClosedDialog,
              edit: this.handleOpenEditDialog,
            })}
            {createDialogVisible &&
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
            }
            {editDialogVisible &&
              <EditTicketDialog
                comment={ticket.comment}
                ticketId={ticket.id}
                title={_('Edit Ticket {{- name}}', ticket)}
                onClose={this.handleCloseEditDialog}
                onSave={({
                  comment,
                  ticketId,
                }) => {
                  this.handleInteraction();
                  return save({
                    id: ticketId,
                    comment,
                  }).then(this.handleCloseEditDialog);
                }}
              />
            }
            {solvedDialogVisible &&
              <StatusChangeTicketDialog
                title={_('Mark Ticket {{- name}} as solved', ticket)}
                ticketId={ticket.id}
                onClose={this.handleCloseSolvedDialog}
                onSave={this.handleSolve}
              />
            }
            {closedDialogVisible &&
              <StatusChangeTicketDialog
                title={_('Mark Ticket {{- name}} as closed', ticket)}
                ticketId={ticket.id}
                onClose={this.handleCloseClosedDialog}
                onSave={this.handleClose}
              />
            }
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
  onCloseError: PropTypes.func,
  onClosed: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onSolveError: PropTypes.func,
  onSolved: PropTypes.func,
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
