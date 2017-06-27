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

import _ from '../../locale.js';
import {is_defined, is_empty} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesTable} from '../entities/table.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import {GROUPS_FILTER_FILTER} from '../../gmp/models/filter.js';

import GroupDialog from './dialog.js';
import Header from './header.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
];

const ToolBarIcons = ({
    onNewGroupClick,
  }, {capabilities}) => {
  return (
    <Layout flex box>
      <HelpIcon
        page="groups"
        title={_('Help: Groups')}/>
      {capabilities.mayCreate('group') &&
        <NewIcon
          title={_('New Group')}
          onClick={onNewGroupClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewGroupClick: PropTypes.func.isRequired,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openDialog = this.openDialog.bind(this);
  }

  openDialog(group) {
    const {gmp} = this.context;

    if (is_defined(group)) {
      let users;

      if (is_empty(group.users)) {
        users = [];
      }
      else {
        users = group.users.split(',').map(user => user.trim());
      }

      this.dialog.show({
        id: group.id,
        name: group.name,
        comment: group.comment,
        users,
      }, {
        title: _('Edit Group {{name}}', group)
      });
    }
    else {
      this.dialog.show({});
    }

    gmp.users.getAll().then(users => {
      this.dialog.setValue('all_users', users);
    });
  }

  render() {
    const {onEntitySave} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onNewGroupClick={this.openDialog}
          onEditGroup={this.openDialog}
        />
        <GroupDialog
          ref={ref => this.dialog = ref}
          onSave={onEntitySave}
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
  emptyTitle: _('No Groups available'),
  header: Header,
  row: Row,
  footer: createEntitiesFooter({
    download: 'groups.xml',
    span: 7,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'group', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  filtersFilter: GROUPS_FILTER_FILTER,
  sectionIcon: 'group.svg',
  table: Table,
  title: _('Groups'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
