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
import {first, is_defined, is_empty} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import EntitiesPage from '../entities/page.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesTable} from '../entities/table.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';

import Layout from '../components/layout/layout.js';

import {createFilterDialog} from '../components/powerfilter/dialog.js';

import {ROLES_FILTER_FILTER} from 'gmp/models/filter.js';

import Header from '../groups/header.js';

import RoleDialog from './dialog.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
];

const ToolBarIcons = ({
    onNewRoleClick,
  }, {capabilities}) => {
  return (
    <Layout flex box>
      <HelpIcon
        page="roles"
        title={_('Help: Roles')}/>
      {capabilities.mayCreate('role') &&
        <NewIcon
          title={_('New Role')}
          onClick={onNewRoleClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewRoleClick: PropTypes.func.isRequired,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleCreatePermission = this.handleCreatePermission.bind(this);
    this.handleCreateSuperPermission =
      this.handleCreateSuperPermission.bind(this);
    this.handleDeletePermission = this.handleDeletePermission.bind(this);
    this.openCreateDialog = this.openCreateDialog.bind(this);
  }

  openCreateDialog(role) {
    const {gmp} = this.context;

    if (is_defined(role)) {
      let users;

      if (is_empty(role.users)) {
        users = [];
      }
      else {
        users = role.users.split(',').map(user => user.trim());
      }

      this.dialog.show({
        id: role.id,
        name: role.name,
        comment: role.comment,
        in_use: role.isInUse(),
        users,
      }, {
        title: _('Edit Role {{name}}', role)
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

    gmp.users.getAll().then(users => {
      this.dialog.setValue('all_users', users);
    });
  }

  handleCreateSuperPermission({role_id, group_id}) {
    const {gmp} = this.context;

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
    const {gmp} = this.context;

    const promise = gmp.permission.create({
      name,
      role_id,
      subject_type: 'role',
    });

    this.loadSettings(promise, role_id);
  }

  handleDeletePermission({role_id, permission_id}) {
    const {gmp} = this.context;

    this.loadSettings(gmp.permission.delete({id: permission_id}), role_id);
  }

  loadSettings(promise, role_id) {
    const {gmp} = this.context;

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
    const {onEntitySave} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onNewRoleClick={this.openCreateDialog}
          onEditRole={this.openCreateDialog}
        />
        <RoleDialog
          ref={ref => this.dialog = ref}
          onSave={onEntitySave}
          onCreatePermission={this.handleCreatePermission}
          onCreateSuperPermission={this.handleCreateSuperPermission}
          onDeletePermission={this.handleDeletePermission}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  onEntitySave: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No Roles available'),
  header: Header,
  row: Row,
  footer: createEntitiesFooter({
    download: 'roles.xml',
    span: 7,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'role', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  filtersFilter: ROLES_FILTER_FILTER,
  sectionIcon: 'role.svg',
  table: Table,
  title: _('Roles'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
