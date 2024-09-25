/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {ROLES_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import RoleIcon from 'web/components/icon/roleicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/roles';

import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

import RoleComponent from './component';
import Table from './table';
import RolesFilterDialog from './filterdialog';

const ToolBarIcons = ({onRoleCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        page="web-interface-access"
        anchor="managing-roles"
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
      onCreated={onChanged}
      onSaved={onChanged}
      onCloned={onChanged}
      onCloneError={onError}
      onDeleted={onChanged}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={onInteraction}
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

// vim: set ts=2 sw=2 tw=80:
