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
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import SelectionType from '../../utils/selectiontype.js';

import EntitiesPage from '../../entities/page.js';
import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesTable} from '../../entities/table.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import {USERS_FILTER_FILTER} from 'gmp/models/filter.js';
import Promise from 'gmp/promise.js';

import ConfirmDeleteDialog from './confirmdeletedialog.js';
import UserDialog from './dialog.js';
import Header from './header.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['roles', _('Roles')],
  ['groups', _('Groups')],
  ['host_access', _('Host Access')],
  ['ldpa', _('Authentication Type')],
];

const ToolBarIcons = ({
    onNewUserClick,
  }, {capabilities}) => {
  return (
    <IconDivider>
      <HelpIcon
        page="users"
        title={_('Help: Users')}/>
      {capabilities.mayCreate('user') &&
        <NewIcon
          title={_('New User')}
          onClick={onNewUserClick}/>
      }
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onNewUserClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDeleteUser = this.handleDeleteUser.bind(this);

    this.openConfirmDeleteDialog = this.openConfirmDeleteDialog.bind(this);
    this.openUserDialog = this.openUserDialog.bind(this);
  }

  handleDeleteUser({deleteUsers, id, inheritor_id}) {
    const {onChanged} = this.props;

    if (inheritor_id === '--') {
      inheritor_id = undefined;
    }

    if (is_defined(id)) {
      const {entityCommand} = this.props;
      return entityCommand.delete({id, inheritor_id}).then(() => onChanged());
    }

    const {entitiesCommand} = this.props;
    return entitiesCommand.delete(deleteUsers, {inheritor_id})
      .then(() => onChanged());
  }

  openUserDialog(user) {
    const {gmp} = this.context;

    gmp.user.currentAuthSettings().then(response => {
      if (is_defined(user)) {
        const group_ids = user.groups.map(group => group.id);
        const role_ids = user.roles.map(role => role.id);

        this.dialog.show({
          id: user.id,
          name: user.name,
          old_name: user.name,
          auth_method: user.auth_method,
          access_hosts: user.hosts.addresses,
          access_ifaces: user.ifaces.addresses,
          comment: user.comment,
          group_ids: group_ids,
          hosts_allow: user.hosts.allow,
          ifaces_allow: user.ifaces.allow,
          role_ids: role_ids,
          settings: response.data,
        }, {
          title: _('Edit User {{name}}', user)
        });
      }
      else {
        this.dialog.show({settings: response.data});
      }

      gmp.groups.getAll({
        filter: 'permission=modify_group', //  list only groups current user may modify
      }).then(groups =>
        this.dialog.setValue('groups', groups));
      gmp.roles.getAll().then(roles => this.dialog.setValue('roles', roles));
    });
  }

  openConfirmDeleteDialog(user) {
    const {entitiesCommand} = this.props;

    entitiesCommand.getAll().then(users => {

      if (is_defined(user)) {
        users = users.filter(luser => luser.id !== user.id);

        this.confirm_delete_dialog.show({
          id: user.id,
          username: user.name,
          users,
        }, {
          title: _('Confirm deletion of user {{name}}', user),
        });

      }
      else {
        const {selectionType} = this.props;
        let promise;

        if (selectionType === SelectionType.SELECTION_USER) {
          const {entitiesSelected} = this.props;
          promise = Promise.resolve([...entitiesSelected]);
        }
        else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
          const {entities} = this.props;
          promise = Promise.resolve(entities);
        }
        else {
          const {filter} = this.props;
          promise = entitiesCommand.get({filter: filter.all()});
        }

        promise.then(deleteUsers => {
          let ids = deleteUsers.map(luser => luser.id);

          users = users.filter(luser => !ids.includes(luser.id));

          this.confirm_delete_dialog.show({
            users,
            deleteUsers,
          }, {
            title: _('Confirm deletion of users'),
          });
        });
      }
    });
  }

  render() {
    const {onEntitySave} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onNewUserClick={this.openUserDialog}
          onEditUser={this.openUserDialog}
          onEntityDelete={this.openConfirmDeleteDialog}
          onDeleteBulk={this.openConfirmDeleteDialog}
        />
        <UserDialog
          ref={ref => this.dialog = ref}
          onSave={onEntitySave}
        />
        <ConfirmDeleteDialog
          ref={ref => this.confirm_delete_dialog = ref}
          onSave={this.handleDeleteUser}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entities: PropTypes.collection,
  entityCommand: PropTypes.entitycommand,
  entitiesCommand: PropTypes.entitiescommand,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter,
  selectionType: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
  onEntitySave: PropTypes.func.isRequired,
};


Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No Users available'),
  header: Header,
  row: Row,
  footer: createEntitiesFooter({
    download: 'users.xml',
    span: 7,
    delete: true,
  }),
});

export default withEntitiesContainer('user', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  filtersFilter: USERS_FILTER_FILTER,
  sectionIcon: 'user.svg',
  table: Table,
  title: _('Users'),
  toolBarIcons: ToolBarIcons,
})(Page);

// vim: set ts=2 sw=2 tw=80:
