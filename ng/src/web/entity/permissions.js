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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined, select_save_id} from 'gmp/utils';

import PropTypes from '../utils/proptypes.js';

import ManualIcon from '../components/icon/manualicon.js';
import NewIcon from '../components/icon/newicon.js';

import Layout from '../components/layout/layout.js';
import IconDivider from '../components/layout/icondivider.js';

import MultiplePermissionDialog, {
  CURRENT_RESOURCE_ONLY,
  INCLUDE_RELATED_RESOURCES,
} from '../pages/permissions/multipledialog.js';
import PermissionsTable from '../pages/permissions/table.js';
import PermissionComponent from '../pages/permissions/component.js';

const SectionElementDivider = glamorous(IconDivider)({
  marginBottom: '3px',
});

const SectionElements = ({
  entity,
  onPermissionCreateClick,
}) => {
  return (
    <Layout grow align="end">
      <SectionElementDivider>
        <NewIcon
          title={_('New Permission')}
          onClick={onPermissionCreateClick}
        />
        <ManualIcon
          page="gui_administration"
          anchor="permissions"
          title={_('Help: Permissions')}
        />
      </SectionElementDivider>
    </Layout>
  );
};

SectionElements.propTypes = {
  entity: PropTypes.model.isRequired,
  onPermissionCreateClick: PropTypes.func.isRequired,
};

class EntityPermissions extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      multiplePermissionDialogVisible: false,
    };

    this.handleMultipleSave = this.handleMultipleSave.bind(this);
    this.openMultiplePermissionDialog = this.openMultiplePermissionDialog
      .bind(this);
    this.closeMultiplePermissionDialog = this.closeMultiplePermissionDialog
      .bind(this);
    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission) {
    const {onPermissionEditClick} = this.props;

    if (is_defined(onPermissionEditClick)) {
      onPermissionEditClick(permission, true);
    }
  }

  openMultiplePermissionDialog(permission) {
    const {relatedResourcesLoaders = [], entity} = this.props;
    const {gmp} = this.context;

    this.setState({
      multiplePermissionDialogVisible: true,
      entity_type: entity.entity_type,
      entity_name: entity.name,
      id: entity.id,
      include_related: relatedResourcesLoaders.length === 0 ?
        CURRENT_RESOURCE_ONLY : INCLUDE_RELATED_RESOURCES,
      title: _('Create Multiple Permissions'),
    });

    Promise
      .all(relatedResourcesLoaders.map(func => func({entity, gmp})))
      .then(loaded => {
        const related = loaded.reduce((sum, cur) => sum.concat(cur), []);

        this.setState({
          related,
        });
      });

    gmp.groups.getAll().then(response => {
      const {data: groups} = response;
      this.setState({
        groups,
        group_id: select_save_id(groups),
      });
    });
    gmp.roles.getAll().then(response => {
      const {data: roles} = response;
      this.setState({
        roles,
        role_id: select_save_id(roles),
      });
    });
    gmp.users.getAll().then(response => {
      const {data: users} = response;
      this.setState({
        users,
        user_id: select_save_id(users),
      });
    });
  }

  closeMultiplePermissionDialog() {
    this.setState({multiplePermissionDialogVisible: false});
  }

  handleMultipleSave(data) {
    const {onChanged} = this.props;
    const {gmp} = this.context;
    return gmp.permissions.create(data).then(onChanged);
  }

  render() {
    const {
      entity,
      permissions,
      ...props
    } = this.props;

    const {
      multiplePermissionDialogVisible,
      entity_type,
      entity_name,
      group_id,
      groups,
      id,
      include_related,
      role_id,
      roles,
      title,
      user_id,
      users,
    } = this.state;

    const extra = (
      <SectionElements
        entity={entity}
        onPermissionCreateClick={this.openMultiplePermissionDialog}
      />
    );

    const has_permissions = is_defined(permissions);
    const count = has_permissions ? permissions.length : 0;

    return (
      <Layout
        flex="column"
        title={_('Permissions ({{count}})', {count})}
      >
        {extra}
        {count === 0 &&
          _('No permissions available')
        }
        {count > 0 &&
          <PermissionsTable
            {...props}
            entities={permissions}
            pagination={false}
            footer={false}
            footnote={false}
            onPermissionEditClick={this.openPermissionDialog}
          />
        }
        <MultiplePermissionDialog
          visible={multiplePermissionDialogVisible}
          entity_type={entity_type}
          entity_name={entity_name}
          group_id={group_id}
          groups={groups}
          id={id}
          include_related={include_related}
          role_id={role_id}
          roles={roles}
          title={title}
          user_id={user_id}
          users={users}
          onClose={this.closeMultiplePermissionDialog}
          onSave={this.handleMultipleSave}
        />
      </Layout>
    );
  }
}

EntityPermissions.propTypes = {
  entity: PropTypes.model.isRequired,
  permissions: PropTypes.array,
  relatedResourcesLoaders: PropTypes.arrayOf(PropTypes.func),
  onChanged: PropTypes.func.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

EntityPermissions.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Permissions = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <PermissionComponent
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
    }) => (
      <EntityPermissions
        {...props}
        onChanged={onChanged}
        onPermissionCreateClick={create}
        onPermissionCloneClick={clone}
        onPermissionDeleteClick={delete_func}
        onPermissionDownloadClick={download}
        onPermissionEditClick={edit}
      />
    )}
  </PermissionComponent>
);

Permissions.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default Permissions;

// vim: set ts=2 sw=2 tw=80:
