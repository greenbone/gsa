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
import {is_defined, shorten, select_save_id} from 'gmp/utils.js';

import Promise from 'gmp/promise.js';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import PermissionDialog from './dialog.js';

class PermissionsComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission, fixed = false) {
    const {gmp, capabilities} = this.context;

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
        permission,
        name: permission.name,
        comment: permission.comment,
        subject_type,
        resource_id: is_defined(permission.resource) ?
          permission.resource.id : '',
        resource_type: is_defined(permission.resource) ?
          permission.resource.entity_type : '',
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
      state = {};
    }

    state.fixedResource = fixed;

    if (capabilities.mayAccess('users')) {
      users_promise = gmp.users.getAll({cache: false});

      if (!is_defined(state.subject_type)) {
        state.subject_type = 'user';
      }
    }
    else {
      users_promise = Promise.resolve();
    }

    if (capabilities.mayAccess('roles')) {
      roles_promise = gmp.roles.getAll({cache: false});

      if (!capabilities.mayAccess('users') &&
        !is_defined(state.subject_type)) {
        state.subject_type = 'role';
      }
    }
    else {
      roles_promise = Promise.resolve();
    }

    if (capabilities.mayAccess('groups')) {
      groups_promise = gmp.groups.getAll({cache: false});

      if (!capabilities.mayAccess('users') &&
        !capabilities.mayAccess('roles') && !is_defined(state.subject_type)) {
        state.subject_type = 'group';
      }
    }
    else {
      groups_promise = Promise.resolve();
    }

    this.permission_dialog.show(state, opts);

    users_promise.then(users => {
      this.permission_dialog.setValues({
        user_id: select_save_id(users, state.user_id),
        users,
      });
    });

    roles_promise.then(roles => {
      this.permission_dialog.setValues({
        role_id: select_save_id(roles, state.role_id),
        roles,
      });
    });

    groups_promise.then(groups => {
      this.permission_dialog.setValues({
        group_id: select_save_id(groups, state.group_id),
        groups,
      });
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
              ref={ref => this.permission_dialog = ref}
              onSave={save}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

PermissionsComponent.propTypes = {
  children: PropTypes.func.isRequired,
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

PermissionsComponent.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

export default PermissionsComponent;

// vim: set ts=2 sw=2 tw=80:
