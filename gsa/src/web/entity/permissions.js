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

import _ from 'gmp/locale';

import {getEntityType} from 'gmp/utils/entitytype';
import {is_defined} from 'gmp/utils/identity';
import {select_save_id} from 'gmp/utils/id';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';

import MultiplePermissionDialog, {
  CURRENT_RESOURCE_ONLY,
  INCLUDE_RELATED_RESOURCES,
} from 'web/pages/permissions/multipledialog';
import PermissionsTable from 'web/pages/permissions/table';
import PermissionComponent from 'web/pages/permissions/component';

const SectionElementDivider = glamorous(IconDivider)({
  marginBottom: '3px',
});

const SectionElements = withCapabilities(({
  capabilities,
  onPermissionCreateClick,
}) => (
  <Layout grow align="end">
    <SectionElementDivider>
      {capabilities.mayCreate('permission') &&
        <NewIcon
          title={_('New Permission')}
          onClick={onPermissionCreateClick}
        />
      }
      <ManualIcon
        page="gui_administration"
        anchor="permissions"
        title={_('Help: Permissions')}
      />
    </SectionElementDivider>
  </Layout>
));

SectionElements.propTypes = {
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

  openMultiplePermissionDialog() {
    const {gmp, relatedResourcesLoaders = [], entity} = this.props;

    const entityType = getEntityType(entity);

    this.setState({
      multiplePermissionDialogVisible: true,
      entityType,
      entityName: entity.name,
      id: entity.id,
      title: _('Create Multiple Permissions'),
    });

    Promise
      .all(relatedResourcesLoaders.map(func => func({entity, gmp})))
      .then(loaded => {
        const related = loaded.reduce((sum, cur) => sum.concat(cur), []);

        this.setState({
          related,
          includeRelated: loaded.length === 0 ?
            CURRENT_RESOURCE_ONLY : INCLUDE_RELATED_RESOURCES,
        });
      });

    gmp.groups.getAll().then(response => {
      const {data: groups} = response;
      this.setState({
        groups,
        groupId: select_save_id(groups),
      });
    });
    gmp.roles.getAll().then(response => {
      const {data: roles} = response;
      this.setState({
        roles,
        roleId: select_save_id(roles),
      });
    });
    gmp.users.getAll().then(response => {
      const {data: users} = response;
      this.setState({
        users,
        userId: select_save_id(users),
      });
    });
  }

  closeMultiplePermissionDialog() {
    this.setState({multiplePermissionDialogVisible: false});
  }

  handleMultipleSave(data) {
    const {gmp, onChanged} = this.props;
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
      entityType,
      entityName,
      groupId,
      groups,
      id,
      includeRelated,
      related,
      roleId,
      roles,
      title,
      userId,
      users,
    } = this.state;

    const extra = (
      <SectionElements
        entity={entity}
        onPermissionCreateClick={this.openMultiplePermissionDialog}
      />
    );

    const hasPermissions = is_defined(permissions);
    const count = hasPermissions ? permissions.length : 0;

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
        {multiplePermissionDialogVisible &&
          <MultiplePermissionDialog
            entityType={entityType}
            entityName={entityName}
            groupId={groupId}
            groups={groups}
            id={id}
            includeRelated={includeRelated}
            related={related}
            roleId={roleId}
            roles={roles}
            title={title}
            userId={userId}
            users={users}
            onClose={this.closeMultiplePermissionDialog}
            onSave={this.handleMultipleSave}
          />
        }
      </Layout>
    );
  }
}

EntityPermissions.propTypes = {
  entity: PropTypes.model.isRequired,
  gmp: PropTypes.gmp.isRequired,
  permissions: PropTypes.array,
  relatedResourcesLoaders: PropTypes.arrayOf(PropTypes.func),
  onChanged: PropTypes.func.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

EntityPermissions = withGmp(EntityPermissions);

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
