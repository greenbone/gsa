/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Gmp from 'gmp/gmp';
import Rejection from 'gmp/http/rejection';
import Group from 'gmp/models/group';
import Model from 'gmp/models/model';
import Permission from 'gmp/models/permission';
import Role from 'gmp/models/role';
import User from 'gmp/models/user';
import {getEntityType} from 'gmp/utils/entitytype';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import {OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation, {TranslateFunc} from 'web/hooks/useTranslation';
import MultiplePermissionDialog, {
  CURRENT_RESOURCE_ONLY,
  INCLUDE_RELATED_RESOURCES,
} from 'web/pages/permissions/MultipleDialog';
import PermissionComponent from 'web/pages/permissions/PermissionsComponent';
import PermissionsTable from 'web/pages/permissions/Table';
import compose from 'web/utils/Compose';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

interface SectionElementsProps {
  onPermissionCreateClick?: () => void;
}

type RelatedResourcesLoader<TEntity> = ({
  entity,
  gmp,
}: {
  entity: TEntity;
  gmp: Gmp;
}) => Promise<Model[]>;

interface PermissionsBaseState {
  entityType?: string;
  entityName?: string;
  groups?: Group[];
  groupId?: string;
  id?: string;
  includeRelated?:
    | typeof CURRENT_RESOURCE_ONLY
    | typeof INCLUDE_RELATED_RESOURCES;
  multiplePermissionDialogVisible: boolean;
  related?: Model[];
  roles?: Role[];
  roleId?: string;
  title?: string;
  users?: User[];
  userId?: string;
}

interface PermissionsBaseProps<TEntity> {
  entity: TEntity;
  gmp: Gmp;
  permissions?: Permission[];
  relatedResourcesLoaders?: RelatedResourcesLoader<TEntity>[];
  _: TranslateFunc;
  onChanged: () => void;
  onPermissionEditClick: (permission: Permission, value: boolean) => void;
}

export interface EntityPermissionsProps<TEntity = Model> {
  entity: TEntity;
  permissions: Permission[];
  relatedResourcesLoaders?: RelatedResourcesLoader<TEntity>[];
  onChanged?: () => void;
  onDownloaded?: OnDownloadedFunc;
  onError?: (error: Error | Rejection) => void;
}

const SectionElementDivider = styled(IconDivider)`
  margin-bottom: 3px;
`;

const SectionElements = ({onPermissionCreateClick}: SectionElementsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
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
  );
};

class PermissionsBase<TEntity extends Model> extends React.Component<
  PermissionsBaseProps<TEntity>,
  PermissionsBaseState
> {
  constructor(props: PermissionsBaseProps<TEntity>) {
    super(props);

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

  openPermissionDialog(permission: Permission) {
    const {onPermissionEditClick} = this.props;

    if (isDefined(onPermissionEditClick)) {
      onPermissionEditClick(permission, true);
    }
  }

  openMultiplePermissionDialog() {
    const {_} = this.props;

    const {gmp, relatedResourcesLoaders = [], entity} = this.props;

    const entityType = getEntityType(entity);

    this.setState({
      multiplePermissionDialogVisible: true,
      entityType,
      entityName: entity.name,
      id: entity.id,
      title: _('Create Multiple Permissions'),
    });

    void Promise.all(
      relatedResourcesLoaders.map(func => func({entity, gmp})),
    ).then(loaded => {
      const related = loaded.reduce((sum, cur) => sum.concat(cur), []);

      this.setState({
        related,
        includeRelated:
          loaded.length === 0
            ? CURRENT_RESOURCE_ONLY
            : INCLUDE_RELATED_RESOURCES,
      });
    });

    // @ts-expect-error
    gmp.groups.getAll().then(response => {
      const {data: groups} = response;
      this.setState({
        groups,
        groupId: selectSaveId(groups),
      });
    });
    // @ts-expect-error
    gmp.roles.getAll().then(response => {
      const {data: roles} = response;
      this.setState({
        roles,
        roleId: selectSaveId(roles),
      });
    });
    void gmp.users.getAll().then(response => {
      const {data: users} = response;
      this.setState({
        users,
        userId: selectSaveId(users),
      });
    });
  }

  closeMultiplePermissionDialog() {
    this.setState({multiplePermissionDialogVisible: false});
  }

  handleChange(value: unknown, name: string) {
    // @ts-expect-error
    this.setState({[name]: value});
  }

  handleCloseMultiplePermissionDialog() {
    this.closeMultiplePermissionDialog();
  }

  handleMultipleSave(data) {
    const {gmp, onChanged} = this.props;

    // @ts-expect-error
    return gmp.permissions
      .create(data)
      .then(onChanged)
      .then(() => this.closeMultiplePermissionDialog());
  }

  render() {
    const {_} = this.props;

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
            // @ts-expect-error
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
            // @ts-expect-error
            groups={groups}
            // @ts-expect-error
            id={id}
            includeRelated={includeRelated}
            // @ts-expect-error
            related={related}
            roleId={roleId}
            // @ts-expect-error
            roles={roles}
            title={title}
            userId={userId}
            // @ts-expect-error
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

const Permissions = compose(withGmp, withTranslation)(PermissionsBase);

function EntityPermissions<TEntity = Model>({
  entity,
  permissions,
  relatedResourcesLoaders,
  onChanged,
  onDownloaded,
  onError,
}: EntityPermissionsProps<TEntity>) {
  return (
    <PermissionComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <Permissions
          entity={entity}
          permissions={permissions}
          relatedResourcesLoaders={relatedResourcesLoaders}
          toggleDetailsIcon={false}
          onChanged={onChanged}
          onPermissionCloneClick={clone}
          onPermissionCreateClick={create}
          onPermissionDeleteClick={deleteFunc}
          onPermissionDownloadClick={download}
          onPermissionEditClick={edit}
        />
      )}
    </PermissionComponent>
  );
}

export default EntityPermissions;
