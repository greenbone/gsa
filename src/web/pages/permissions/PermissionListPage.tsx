/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {PERMISSIONS_FILTER_FILTER} from 'gmp/models/filter';
import Permission from 'gmp/models/permission';
import {PermissionIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import PermissionComponent from 'web/pages/permissions/PermissionComponent';
import PermissionFilterDialog from 'web/pages/permissions/PermissionFilterDialog';
import PermissionListPageToolBarIcons from 'web/pages/permissions/PermissionListPageToolBarIcons';
import PermissionTable from 'web/pages/permissions/PermissionTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/permissions';

interface PermissionEntitiesPageProps {
  onPermissionCloneClick?: (permission: Permission) => void;
  onPermissionCreateClick?: (permission: Permission) => void;
  onPermissionDeleteClick?: (permission: Permission) => void;
  onPermissionDownloadClick?: (permission: Permission) => void;
  onPermissionEditClick?: (permission: Permission) => void;
}

const PermissionListPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}: WithEntitiesContainerComponentProps<Permission>) => {
  const [_] = useTranslation();
  return (
    <PermissionComponent
      onCloneError={onError}
      onCloned={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaveError={onError}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <>
          <PageTitle title={_('Permissions')} />
          <EntitiesPage<Permission, PermissionEntitiesPageProps>
            {...props}
            filterEditDialog={PermissionFilterDialog}
            filtersFilter={PERMISSIONS_FILTER_FILTER}
            sectionIcon={<PermissionIcon size="large" />}
            table={PermissionTable}
            title={_('Permissions')}
            toolBarIcons={
              <PermissionListPageToolBarIcons
                onPermissionCreateClick={create}
              />
            }
            onError={onError}
            onPermissionCloneClick={clone}
            onPermissionCreateClick={create}
            onPermissionDeleteClick={deleteFunc}
            onPermissionDownloadClick={download}
            onPermissionEditClick={edit}
          />
        </>
      )}
    </PermissionComponent>
  );
};

export default withEntitiesContainer<Permission>('permission', {
  entitiesSelector,
  loadEntities,
})(PermissionListPage);
