/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ROLES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import {NewIcon, RoleIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import RolesFilterDialog from 'web/pages/roles/FilterDialog';
import RoleComponent from 'web/pages/roles/RoleComponent';
import Table from 'web/pages/roles/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/roles';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({onRoleCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-roles"
        page="web-interface-access"
        title={_('Help: Roles')}
      />
      {capabilities.mayCreate('role') && (
        <NewIcon title={_('New Role')} onClick={onRoleCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onRoleCreateClick: PropTypes.func.isRequired,
};

const RolesPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
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
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <React.Fragment>
          <PageTitle title={_('Roles')} />
          <EntitiesPage
            {...props}
            filterEditDialog={RolesFilterDialog}
            filtersFilter={ROLES_FILTER_FILTER}
            sectionIcon={<RoleIcon size="large" />}
            table={Table}
            title={_('Roles')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onDownloaded={onDownloaded}
            onError={onError}
            onInteraction={onInteraction}
            onRoleCloneClick={clone}
            onRoleCreateClick={create}
            onRoleDeleteClick={delete_func}
            onRoleDownloadClick={download}
            onRoleEditClick={edit}
            onRoleSaveClick={save}
          />
        </React.Fragment>
      )}
    </RoleComponent>
  );
};

RolesPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('role', {
  entitiesSelector,
  loadEntities,
})(RolesPage);
