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

import Layout from '../../components/layout/layout.js';

import withEntityComponent from '../../entity/withEntityComponent.js';

import PermissionDialog from './dialog.js';

const DEFAULT_MAPPING = {
  clone: 'onPermissionCloneClick',
  onCloned: 'onCloned',
  delete: 'onPermissionDeleteClick',
  onDeleted: 'onDeleted',
  save: 'onPermissionSaveClick',
  onSaved: 'onSaved',
  download: 'onPermissionDownloadClick',
  onDownloaded: 'onDownloaded',
  create: 'onPermissionCreateClick',
  edit: 'onPermissionEditClick',
};

const withPermissionsComponent = (mapping = {}) => Component => {

  // use default mapping and override afterwards with current mapping
  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class PermissionsComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.openPermissionDialog = this.openPermissionDialog.bind(this);
    }

    openPermissionDialog(permission, fixed = false) {
      const {gmp, capabilities} = this.context;

      let users_promise;
      let roles_promise;
      let groups_promise;
      let title;
      let state;

      if (is_defined(permission)) {
        const subject_type = is_defined(permission.subject) ?
          permission.subject.type : undefined;

        state = {
          id: permission.id,
          permission,
          name: permission.name,
          comment: permission.comment,
          subject_type,
          resource_id: is_defined(permission.resource) ?
            permission.resource.id : '',
          resource_type: is_defined(permission.resource) ?
            permission.resource.type : '',
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

        title = _('Edit permission {{name}}', {name: shorten(permission.name)});
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

      this.permission_dialog.show(state, {title});

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
        create,
        edit,
        save,
      } = mapping;

      const onSaveClick = this.props[save];
      const has_save = is_defined(onSaveClick);

      const handlers = {
        [create]: has_save ? this.openPermissionDialog : undefined,
        [edit]: has_save ? this.openPermissionDialog : undefined,
      };

      return (
        <Layout>
          <Component
            {...this.props}
            {...handlers}
          />
          <PermissionDialog
            ref={ref => this.permission_dialog = ref}
            onSave={onSaveClick}
          />
        </Layout>
      );
    }
  }

  PermissionsComponentWrapper.propTypes = {
    onError: PropTypes.func,
  };

  PermissionsComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
    capabilities: PropTypes.capabilities.isRequired,
  };

  return withEntityComponent('permission', mapping)(
    PermissionsComponentWrapper);
};

export default withPermissionsComponent;

// vim: set ts=2 sw=2 tw=80:
