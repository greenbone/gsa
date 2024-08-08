/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import GroupDialog from './dialog';

class GroupComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseGroupDialog = this.handleCloseGroupDialog.bind(this);
    this.openGroupDialog = this.openGroupDialog.bind(this);
  }

  openGroupDialog(group) {
    const {gmp} = this.props;

    this.handleInteraction();

    let allUsers = [];
    gmp.users.getAll().then(response => {
      allUsers = response.data;
      this.setState({allUsers});
    });

    if (isDefined(group)) {
      const title = _('Edit Group {{name}}', group);

      this.setState({
        allUsers,
        dialogVisible: true,
        group,
        title,
      });
    } else {
      this.setState({
        allUsers,
        dialogVisible: true,
        group,
      });
    }
  }

  closeGroupDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseGroupDialog() {
    this.closeGroupDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
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

    const {allUsers, dialogVisible, group, title} = this.state;

    return (
      <EntityComponent
        name="group"
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
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openGroupDialog,
              edit: this.openGroupDialog,
            })}
            {dialogVisible && (
              <GroupDialog
                allUsers={allUsers}
                group={group}
                title={title}
                onClose={this.handleCloseGroupDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeGroupDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

GroupComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
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

export default withGmp(GroupComponent);
