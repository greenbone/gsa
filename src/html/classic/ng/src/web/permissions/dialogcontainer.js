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

import {is_defined, select_save_id} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import PermissionDialog from './dialog.js';

import PromiseFactory from '../../gmp/promise.js';

class PermissionDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSave = this.handleSave.bind(this);
  }

  show(state = {}, options) {
    let {gmp, capabilities} = this.context;
    let users_promise;
    let roles_promise;
    let groups_promise;

    if (capabilities.mayAccess('users')) {
      users_promise = gmp.users.getAll({cache: false});

      if (!is_defined(state.subject_type)) {
        state.subject_type = 'user';
      }
    }
    else {
      users_promise = PromiseFactory.resolve();
    }

    if (capabilities.mayAccess('roles')) {
      roles_promise = gmp.roles.getAll({cache: false});

      if (!capabilities.mayAccess('users') && !is_defined(state.subject_type)) {
        state.subject_type = 'role';
      }
    }
    else {
      roles_promise = PromiseFactory.resolve();
    }

    if (capabilities.mayAccess('groups')) {
      groups_promise = gmp.groups.getAll({cache: false});

      if (!capabilities.mayAccess('users') &&
        !capabilities.mayAccess('roles') && !is_defined(state.subject_type)) {
        state.subject_type = 'group';
      }
    }
    else {
      groups_promise = PromiseFactory.resolve();
    }

    this.permission_dialog.show(state, options);

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

  handleSave(data) {
    let {onSave} = this.props;
    let {gmp} = this.context;
    let promise;

    if (is_defined(data.id)) {
      promise = gmp.permission.save(data);
    }
    else {
      promise = gmp.permission.create(data);
    }

    return promise.then(permission => {
      if (onSave) {
        onSave(permission);
      }
    });
  }

  render() {
    return (
      <Layout>
        <PermissionDialog
          ref={ref => this.permission_dialog = ref}
          onSave={this.handleSave}
        />
      </Layout>
    );
  }
}

PermissionDialogContainer.propTypes = {
  onSave: PropTypes.func,
};

PermissionDialogContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

export default PermissionDialogContainer;

// vim: set ts=2 sw=2 tw=80:
