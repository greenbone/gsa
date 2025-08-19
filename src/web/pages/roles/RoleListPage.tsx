/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ROLES_FILTER_FILTER} from 'gmp/models/filter';
import Role from 'gmp/models/role';
import {RoleIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import RoleComponent from 'web/pages/roles/RoleComponent';
import RoleFilterDialog from 'web/pages/roles/RoleFilterDialog';
import ToolBarIcons from 'web/pages/roles/RoleListPageToolBarIcons';
import Table from 'web/pages/roles/RoleTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/roles';

interface RoleEntitiesPageProps {
  onRoleCloneClick?: (role: Role) => void;
  onRoleCreateClick?: () => void;
  onRoleDeleteClick?: (role: Role) => void;
  onRoleDownloadClick?: (role: Role) => void;
  onRoleEditClick?: (role: Role) => void;
}

const RolesPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}: WithEntitiesContainerComponentProps<Role>) => {
  const [_] = useTranslation();
  return (
    <RoleComponent
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
        <>
          <PageTitle title={_('Roles')} />
          <EntitiesPage<Role, RoleEntitiesPageProps>
            {...props}
            createFilterType="role"
            filterEditDialog={RoleFilterDialog}
            filtersFilter={ROLES_FILTER_FILTER}
            sectionIcon={<RoleIcon size="large" />}
            table={Table}
            title={_('Roles')}
            toolBarIcons={<ToolBarIcons onRoleCreateClick={create} />}
            onError={onError}
            onRoleCloneClick={clone}
            onRoleCreateClick={create}
            onRoleDeleteClick={deleteFunc}
            onRoleDownloadClick={download}
            onRoleEditClick={edit}
          />
        </>
      )}
    </RoleComponent>
  );
};

export default withEntitiesContainer<Role>('role', {
  entitiesSelector,
  loadEntities,
})(RolesPage);
