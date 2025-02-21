/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import EntityComponent from 'web/entity/Component';
import GroupDialog from 'web/pages/groups/Dialog';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';


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
