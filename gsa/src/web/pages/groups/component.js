/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

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
