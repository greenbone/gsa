/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import UserDialog from './dialog';

class UserComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
    };

    this.handleCloseUserDialog = this.handleCloseUserDialog.bind(this);
    this.openUserDialog = this.openUserDialog.bind(this);
  }

  openUserDialog(user) {
    const {gmp} = this.props;

    this.handleInteraction();

    gmp.groups
      .getAll({
        filter: 'permission=modify_group', //  list only groups current user may modify
      })
      .then(resp => this.setState({groups: resp.data}));

    gmp.roles.getAll().then(resp => this.setState({roles: resp.data}));

    gmp.user.currentAuthSettings().then(response => {
      if (isDefined(user)) {
        const groupIds = user.groups.map(group => group.id);
        const roleIds = user.roles.map(role => role.id);

        this.setState({
          dialogVisible: true,
          accessHosts: user.hosts.addresses.join(', '),
          accessIfaces: user.ifaces.addresses.join(', '),
          comment: user.comment,
          groupIds,
          hostsAllow: user.hosts.allow,
          ifacesAllow: user.ifaces.allow,
          name: user.name,
          oldName: user.name,
          roleIds,
          settings: response.data,
          title: _('Edit User {{name}}', user),
          user,
        });
      } else {
        this.setState({
          accessHosts: undefined,
          accessIfaces: undefined,
          comment: undefined,
          dialogVisible: true,
          groupIds: undefined,
          hostsAllow: undefined,
          ifacesAllow: undefined,
          name: undefined,
          oldName: undefined,
          roleIds: undefined,
          settings: response.data,
          title: undefined,
          user: undefined,
        });
      }
    });
  }

  closeUserDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseUserDialog() {
    this.closeUserDialog();
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

    const {
      accessHosts,
      accessIfaces,
      comment,
      dialogVisible,
      groupIds,
      groups,
      hostsAllow,
      ifacesAllow,
      name,
      oldName,
      roleIds,
      roles,
      settings,
      title,
      user,
    } = this.state;

    return (
      <EntityComponent
        name="user"
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
              create: this.openUserDialog,
              edit: this.openUserDialog,
            })}
            {dialogVisible && (
              <UserDialog
                accessHosts={accessHosts}
                accessIfaces={accessIfaces}
                comment={comment}
                groupIds={groupIds}
                groups={groups}
                hostsAllow={hostsAllow}
                ifacesAllow={ifacesAllow}
                name={name}
                oldName={oldName}
                roleIds={roleIds}
                roles={roles}
                settings={settings}
                title={title}
                user={user}
                onClose={this.handleCloseUserDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeUserDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

UserComponent.propTypes = {
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

export default withGmp(UserComponent);

// vim: set ts=2 sw=2 tw=80:
