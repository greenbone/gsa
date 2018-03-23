/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.aterkamp@greenbone.net>
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
import {is_defined, shorten, select_save_id} from 'gmp/utils';

import Promise from 'gmp/promise.js';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose.js';
import withGmp from '../../utils/withGmp.js';
import withCapabilities from '../../utils/withCapabilities.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import PermissionDialog from './dialog.js';

class PermissionsComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closePermissionDialog = this.closePermissionDialog.bind(this);
    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission, fixed = false) {
    const {gmp, capabilities} = this.props;

    let users_promise;
    let roles_promise;
    let groups_promise;
    let state;
    let opts;

    if (is_defined(permission)) {
      const subject_type = is_defined(permission.subject) ?
        permission.subject.entity_type : undefined;

      state = {
        id: permission.id,
        name: permission.name,
        comment: permission.comment,
        group_id: undefined,
        permission,
        resource_id: is_defined(permission.resource) ?
          permission.resource.id : '',
        resource_type: is_defined(permission.resource) ?
          permission.resource.entity_type : '',
        role_id: undefined,
        subject_type,
        title: _('Edit Permission {{name}}', {name: permission.name}),
        user_id: undefined,
      };

      switch (subject_type) {
        case 'user':
          state.user_id = permission.subject.id;
          break;
        case 'role':
          state.role_id = permission.subject.id;
          break;
        case 'group':
          state.group_id = permission.subject.id;
          break;
        default:
          break;
      }
      opts = {
        title: _('Edit permission {{name}}', {name: shorten(permission.name)}),
      };
    }
    else {
      state = {
        comment: undefined,
        id: undefined,
        name: undefined,
        resource_type: undefined,
        resource_id: undefined,
        subject_type: undefined,
        user_id: undefined,
        group_id: undefined,
        role_id: undefined,
        title: undefined,
      };
    }

    state.fixedResource = fixed;

    if (capabilities.mayAccess('users')) {
      users_promise = gmp.users.getAll();

      if (!is_defined(state.subject_type)) {
        state.subject_type = 'user';
      }
    }
    else {
      users_promise = Promise.resolve();
    }

    if (capabilities.mayAccess('roles')) {
      roles_promise = gmp.roles.getAll();

      if (!capabilities.mayAccess('users') &&
        !is_defined(state.subject_type)) {
        state.subject_type = 'role';
      }
    }
    else {
      roles_promise = Promise.resolve();
    }

    if (capabilities.mayAccess('groups')) {
      groups_promise = gmp.groups.getAll();

      if (!capabilities.mayAccess('users') &&
        !capabilities.mayAccess('roles') && !is_defined(state.subject_type)) {
        state.subject_type = 'group';
      }
    }
    else {
      groups_promise = Promise.resolve();
    }

    this.setState({
      ...state,
      dialogVisible: true,
      ...opts,
    });

    users_promise.then(response => {
      const {data: users} = response;
      this.setState({
        user_id: select_save_id(users, state.user_id),
        users,
      });
    });

    roles_promise.then(response => {
      const {data: roles} = response;
      this.setState({
        role_id: select_save_id(roles, state.role_id),
        roles,
      });
    });

    groups_promise.then(response => {
      const {data: groups} = response;
      this.setState({
        group_id: select_save_id(groups, state.group_id),
        groups,
      });
    });
  }

  closePermissionDialog() {
    this.setState({dialogVisible: false});
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
      dialogVisible,
      comment,
      fixedResource,
      id,
      group_id,
      groups,
      name,
      permission,
      resource_id,
      resource_type,
      role_id,
      roles,
      subject_type,
      title,
      user_id,
      users,
    } = this.state;

    return (
      <EntityComponent
        name="permission"
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
              create: this.openPermissionDialog,
              edit: this.openPermissionDialog,
            })}
            <PermissionDialog
              comment={comment}
              fixedResource={fixedResource}
              group_id={group_id}
              groups={groups}
              id={id}
              name={name}
              permission={permission}
              resource_id={resource_id}
              resource_type={resource_type}
              role_id={role_id}
              roles={roles}
              subject_type={subject_type}
              title={title}
              user_id={user_id}
              users={users}
              visible={dialogVisible}
              onClose={this.closePermissionDialog}
              onSave={save}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

PermissionsComponent.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
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

export default compose(
  withGmp,
  withCapabilities,
)(PermissionsComponent);

// vim: set ts=2 sw=2 tw=80:
