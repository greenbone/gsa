/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, first} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import RoleDialog from './dialog.js';

class RoleComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
      error: undefined,
    };

    this.handleCreatePermission = this.handleCreatePermission.bind(this);
    this.handleCreateSuperPermission =
      this.handleCreateSuperPermission.bind(this);
    this.handleDeletePermission = this.handleDeletePermission.bind(this);
    this.handleErrorWasSent = this.handleErrorWasSent.bind(this);

    this.closeRoleDialog = this.closeRoleDialog.bind(this);
    this.openRoleDialog = this.openRoleDialog.bind(this);
  }

  openRoleDialog(role) {
    const {gmp} = this.props;

    let allUsers = [];
    gmp.users.getAll().then(response => {
      allUsers = response.data;
      this.setState({allUsers});
    });

    if (is_defined(role)) {
      this.setState({
        allUsers,
        dialogVisible: true,
        in_use: role.isInUse(),
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

    }
    else {
      this.setState({
        allUsers,
        dialogVisible: true,
        role,
        title: _('New Role'),
      });
    }
  }

  closeRoleDialog() {
    this.setState({dialogVisible: false});
  }

  handleCreateSuperPermission({role_id, group_id}) {
    const {gmp} = this.props;

    const promise = gmp.permission.create({
      name: 'Super',
      resource_type: 'group',
      resource_id: group_id,
      role_id,
      subject_type: 'role',
    });

    return this.loadSettings(promise, role_id);
  }

  handleCreatePermission({role_id, name}) {
    const {gmp} = this.props;

    const promise = gmp.permission.create({
      name,
      role_id,
      subject_type: 'role',
    });

    return this.loadSettings(promise, role_id);
  }

  handleDeletePermission({role_id, permission_id}) {
    const {gmp} = this.props;

    return this.loadSettings(gmp.permission
      .delete({id: permission_id}), role_id);
  }

  handleErrorWasSent() {
    this.setState({error: undefined});
  }

  loadSettings(promise, role_id) {
    const {gmp} = this.props;

    return promise
      .then(() => gmp.role.editRoleSettings({id: role_id}))
      .then(response => {
        const settings = response.data;
        this.setState({
          permissions: settings.permissions,
          all_permissions: settings.all_permissions,
          permission_name: first(settings.all_permissions).name,
        });
      }).catch(error => {
        this.setState({error});
      });
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
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openRoleDialog,
              edit: this.openRoleDialog,
            })}
            {dialogVisible &&
              <RoleDialog
                all_users={allUsers}
                all_groups={allGroups}
                all_permissions={allPermissions}
                externalError={error}
                group_id={groupId}
                permission_name={permissionName}
                permissions={permissions}
                role={role}
                title={title}
                onClose={this.closeRoleDialog}
                onSave={save}
                onCreatePermission={this.handleCreatePermission}
                onCreateSuperPermission={this.handleCreateSuperPermission}
                onDeletePermission={this.handleDeletePermission}
                onExternalErrorSet={this.handleErrorWasSent}
              />
            }
          </Wrapper>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(RoleComponent);

// vim: set ts=2 sw=2 tw=80:
