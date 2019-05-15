/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {first} from 'gmp/utils/array';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import RoleDialog from './dialog.js';

class RoleComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
      error: undefined,
    };

    this.handleCreatePermission = this.handleCreatePermission.bind(this);
    this.handleCreateSuperPermission = this.handleCreateSuperPermission.bind(
      this,
    );
    this.handleDeletePermission = this.handleDeletePermission.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);

    this.handleCloseRoleDialog = this.handleCloseRoleDialog.bind(this);
    this.openRoleDialog = this.openRoleDialog.bind(this);
  }

  openRoleDialog(role) {
    const {gmp} = this.props;

    this.handleInteraction();

    let allUsers = [];
    gmp.users.getAll().then(response => {
      allUsers = response.data;
      this.setState({allUsers});
    });

    if (isDefined(role)) {
      this.setState({
        allUsers,
        dialogVisible: true,
        isInUse: role.isInUse(),
        role,
        title: _('Edit Role {{name}}', role),
      });

      gmp.role.editRoleSettings(role).then(response => {
        const settings = response.data;
        this.setState({
          permissions: settings.permissions,
          allGroups: settings.groups,
          allPermissions: settings.all_permissions,
          groupId: first(settings.groups).id,
          permissionName: first(settings.all_permissions).name,
        });
      });
    } else {
      this.setState({
        allUsers,
        dialogVisible: true,
        role,
        isInUse: false,
        title: _('New Role'),
      });
    }
  }

  closeRoleDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseRoleDialog() {
    this.closeRoleDialog();
    this.handleInteraction();
  }

  handleCreateSuperPermission({roleId, groupId}) {
    const {gmp} = this.props;

    const promise = gmp.permission.create({
      name: 'Super',
      resourceType: 'group',
      resourceId: groupId,
      roleId,
      subjectType: 'role',
    });

    this.handleInteraction();

    return this.loadSettings(promise, roleId);
  }

  handleCreatePermission({roleId, name}) {
    const {gmp} = this.props;

    const promise = gmp.permission.create({
      name,
      roleId,
      subjectType: 'role',
    });

    this.handleInteraction();

    return this.loadSettings(promise, roleId);
  }

  handleDeletePermission({roleId, permissionId}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return this.loadSettings(gmp.permission.delete({id: permissionId}), roleId);
  }

  handleErrorClose() {
    this.setState({error: undefined});
  }

  setError(error) {
    this.setState({error: error.message});
  }

  loadSettings(promise, roleId) {
    const {gmp} = this.props;

    return promise
      .then(() => gmp.role.editRoleSettings({id: roleId}))
      .then(response => {
        const settings = response.data;
        this.setState({
          permissions: settings.permissions,
          allPermissions: settings.all_permissions,
          permissionName: first(settings.all_permissions).name,
        });
      })
      .catch(error => {
        this.setError(error);
      });
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
      allUsers,
      allGroups,
      allPermissions,
      dialogVisible,
      error,
      groupId,
      isInUse,
      permissionName,
      permissions,
      role,
      title,
    } = this.state;

    return (
      <EntityComponent
        name="role"
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
              create: this.openRoleDialog,
              edit: this.openRoleDialog,
            })}
            {dialogVisible && (
              <RoleDialog
                allUsers={allUsers}
                allGroups={allGroups}
                allPermissions={allPermissions}
                error={error}
                isInUse={isInUse}
                groupId={groupId}
                permissionName={permissionName}
                permissions={permissions}
                role={role}
                title={title}
                onClose={this.handleCloseRoleDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d)
                    .then(() => this.closeRoleDialog())
                    .catch(e => this.setError(e));
                }}
                onCreatePermission={this.handleCreatePermission}
                onCreateSuperPermission={this.handleCreateSuperPermission}
                onDeletePermission={this.handleDeletePermission}
                onErrorClose={this.handleErrorClose}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

RoleComponent.propTypes = {
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

export default withGmp(RoleComponent);

// vim: set ts=2 sw=2 tw=80:
