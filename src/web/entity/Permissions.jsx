/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {getEntityType} from 'gmp/utils/entitytype';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PermissionComponent from 'web/pages/permissions/Component';
import MultiplePermissionDialog, {
  CURRENT_RESOURCE_ONLY,
  INCLUDE_RELATED_RESOURCES,
} from 'web/pages/permissions/MultipleDialog';
import PermissionsTable from 'web/pages/permissions/Table';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';
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
          anchor="permissions"
          page="web-interface-access"
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
    this.openMultiplePermissionDialog =
      this.openMultiplePermissionDialog.bind(this);
    this.handleCloseMultiplePermissionDialog =
      this.handleCloseMultiplePermissionDialog.bind(this);
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
            footer={false}
            footnote={false}
            pagination={false}
            onPermissionEditClick={this.openPermissionDialog}
          />
        )}
        {multiplePermissionDialogVisible && (
          <MultiplePermissionDialog
            entityName={entityName}
            entityType={entityType}
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
    onCloneError={onError}
    onCloned={onChanged}
    onCreated={onChanged}
    onDeleteError={onError}
    onDeleted={onChanged}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
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
        onPermissionCloneClick={clone}
        onPermissionCreateClick={create}
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
  onDownloaded: PropTypes.func,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityPermissions;
