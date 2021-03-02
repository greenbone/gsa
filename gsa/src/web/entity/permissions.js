/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import MultiplePermissionDialog, {
  CURRENT_RESOURCE_ONLY,
  INCLUDE_RELATED_RESOURCES,
} from 'web/pages/permissions/multipledialog';
import PermissionsTable from 'web/pages/permissions/table';
import PermissionComponent from 'web/pages/permissions/component';

const SectionElementDivider = styled(IconDivider)`
  margin-bottom: 3px;
`;

const SectionElements = withCapabilities(
  ({capabilities, onPermissionCreateClick}) => (
    <Layout grow align="end">
      <SectionElementDivider>
        {capabilities.mayCreate('permission') && (
          <NewIcon
            title={_('New Permission')}
            onClick={onPermissionCreateClick}
          />
        )}
        <ManualIcon
          page="web-interface-access"
          anchor="permissions"
          title={_('Help: Permissions')}
        />
      </SectionElementDivider>
    </Layout>
  ),
);

SectionElements.propTypes = {
  onPermissionCreateClick: PropTypes.func.isRequired,
};

class Permissions extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      multiplePermissionDialogVisible: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleMultipleSave = this.handleMultipleSave.bind(this);
    this.openMultiplePermissionDialog = this.openMultiplePermissionDialog.bind(
      this,
    );
    this.handleCloseMultiplePermissionDialog = this.handleCloseMultiplePermissionDialog.bind(
      this,
    );
    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission) {
    const {onPermissionEditClick} = this.props;

    if (isDefined(onPermissionEditClick)) {
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

    Promise.all(relatedResourcesLoaders.map(func => func({entity, gmp}))).then(
      loaded => {
        const related = loaded.reduce((sum, cur) => sum.concat(cur), []);

        this.setState({
          related,
          includeRelated:
            loaded.length === 0
              ? CURRENT_RESOURCE_ONLY
              : INCLUDE_RELATED_RESOURCES,
        });
      },
    );

    gmp.groups.getAll().then(response => {
      const {data: groups} = response;
      this.setState({
        groups,
        groupId: selectSaveId(groups),
      });
    });
    gmp.roles.getAll().then(response => {
      const {data: roles} = response;
      this.setState({
        roles,
        roleId: selectSaveId(roles),
      });
    });
    gmp.users.getAll().then(response => {
      const {data: users} = response;
      this.setState({
        users,
        userId: selectSaveId(users),
      });
    });

    this.handleInteraction();
  }

  closeMultiplePermissionDialog() {
    this.setState({multiplePermissionDialogVisible: false});
  }

  handleChange(value, name) {
    this.setState({[name]: value});
  }

  handleCloseMultiplePermissionDialog() {
    this.closeMultiplePermissionDialog();
    this.handleInteraction();
  }

  handleMultipleSave(data) {
    const {gmp, onChanged} = this.props;

    this.handleInteraction();

    return gmp.permissions
      .create(data)
      .then(onChanged)
      .then(() => this.closeMultiplePermissionDialog());
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {entity, permissions, ...props} = this.props;

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

    const hasPermissions = isDefined(permissions);
    const count = hasPermissions ? permissions.length : 0;

    return (
      <Layout flex="column" title={_('Permissions ({{count}})', {count})}>
        {extra}
        {count === 0 && _('No permissions available')}
        {count > 0 && (
          <PermissionsTable
            {...props}
            entities={permissions}
            pagination={false}
            footer={false}
            footnote={false}
            onPermissionEditClick={this.openPermissionDialog}
          />
        )}
        {multiplePermissionDialogVisible && (
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
            onChange={this.handleChange}
            onClose={this.handleCloseMultiplePermissionDialog}
            onSave={this.handleMultipleSave}
          />
        )}
      </Layout>
    );
  }
}

Permissions.propTypes = {
  entity: PropTypes.model.isRequired,
  gmp: PropTypes.gmp.isRequired,
  permissions: PropTypes.array,
  relatedResourcesLoaders: PropTypes.arrayOf(PropTypes.func),
  onChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

Permissions = withGmp(Permissions);

const EntityPermissions = ({
  entity,
  permissions,
  relatedResourcesLoaders,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
}) => (
  <PermissionComponent
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, create, delete: delete_func, download, edit}) => (
      <Permissions
        entity={entity}
        permissions={permissions}
        relatedResourcesLoaders={relatedResourcesLoaders}
        toggleDetailsIcon={false}
        onChanged={onChanged}
        onInteraction={onInteraction}
        onPermissionCreateClick={create}
        onPermissionCloneClick={clone}
        onPermissionDeleteClick={delete_func}
        onPermissionDownloadClick={download}
        onPermissionEditClick={edit}
      />
    )}
  </PermissionComponent>
);

EntityPermissions.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  relatedResourcesLoaders: PropTypes.arrayOf(PropTypes.func),
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityPermissions;

// vim: set ts=2 sw=2 tw=80:
