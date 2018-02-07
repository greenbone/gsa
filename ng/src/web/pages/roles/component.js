/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

    this.handleCreatePermission = this.handleCreatePermission.bind(this);
    this.handleCreateSuperPermission =
      this.handleCreateSuperPermission.bind(this);
    this.handleDeletePermission = this.handleDeletePermission.bind(this);

    this.openRoleDialog = this.openRoleDialog.bind(this);
  }

  openRoleDialog(role) {
    const {gmp} = this.props;

    if (is_defined(role)) {
      this.dialog.show({
        id: role.id,
        name: role.name,
        comment: role.comment,
        in_use: role.isInUse(),
        users: role.users,
      }, {
        title: _('Edit Role {{name}}', role),
      });

      gmp.role.editRoleSettings(role).then(response => {
        const settings = response.data;

        this.dialog.setValues({
          permissions: settings.permissions,
          all_groups: settings.groups,
          all_permissions: settings.all_permissions,
          group_id: first(settings.groups).id,
          permission_name: first(settings.all_permissions).name,
        });
      });

    }
    else {
      this.dialog.show();
    }

    gmp.users.getAll().then(response => {
      this.dialog.setValue('all_users', response.data);
    });
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

    this.loadSettings(promise, role_id);
  }

  handleCreatePermission({role_id, name}) {
    const {gmp} = this.props;

    const promise = gmp.permission.create({
      name,
      role_id,
      subject_type: 'role',
    });

    this.loadSettings(promise, role_id);
  }

  handleDeletePermission({role_id, permission_id}) {
    const {gmp} = this.props;

    this.loadSettings(gmp.permission.delete({id: permission_id}), role_id);
  }

  loadSettings(promise, role_id) {
    const {gmp} = this.props;

    promise
      .then(() => gmp.role.editRoleSettings({id: role_id}))
      .then(response => {
        const settings = response.data;

        this.dialog.setValues({
          permissions: settings.permissions,
          all_permissions: settings.all_permissions,
          permission_name: first(settings.all_permissions).name,
        });
      }).catch(error => this.dialog.setError(error));
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
            <RoleDialog
              ref={ref => this.dialog = ref}
              onSave={save}
              onCreatePermission={this.handleCreatePermission}
              onCreateSuperPermission={this.handleCreateSuperPermission}
              onDeletePermission={this.handleDeletePermission}
            />
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
