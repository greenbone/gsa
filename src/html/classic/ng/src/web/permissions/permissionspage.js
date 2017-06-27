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
import {is_defined, shorten} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import PermissionDialog from './dialogcontainer.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['description', _('Description')],
  ['type', _('Resource Type')],
  ['_resource', _('Resource')],
  ['subject_type', _('Subject Type')],
  ['_subject', _('Subject')],
];

const ToolBarIcons = ({
    onNewPermissionClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="permissions"
        title={_('Help: Permissions')}/>
      {capabilities.mayCreate('permission') &&
        <NewIcon
          title={_('New Permission')}
          onClick={onNewPermissionClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewPermissionClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openPermissionDialog = this.openPermissionDialog.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  openPermissionDialog(permission) {
    if (is_defined(permission)) {
      let subject_type = is_defined(permission.subject) ?
        permission.subject.type : undefined;

      let state = {
        id: permission.id,
        permission,
        name: permission.name,
        comment: permission.comment,
        subject_type,
        resource_id: is_defined(permission.resource) ? permission.resource.id :
          '',
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

      this.permission_dialog.show(state, {
        title: _('Edit permission {{name}}', {name: shorten(permission.name)}),
      });
    }
    else {
      this.permission_dialog.show({});
    }
  }

  onSave() {
    let {onChanged} = this.props;
    if (onChanged) {
      onChanged();
    }
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openPermissionDialog}
          onNewPermissionClick={this.openPermissionDialog}
        />
        <PermissionDialog
          ref={ref => this.permission_dialog = ref}
          onSave={this.onSave}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func,
  onEntitySave: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No permissions available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  footer: createEntitiesFooter({
    download: 'permissions.xml',
    span: 7,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'permission', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'permission.svg',
  table: Table,
  title: _('Permissions'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
