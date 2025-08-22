/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {PERMISSIONS_FILTER_FILTER} from 'gmp/models/filter';
import {NewIcon, PermissionIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PermissionComponent from 'web/pages/permissions/PermissionComponent';
import PermissionFilterDialog from 'web/pages/permissions/PermissionFilterDialog';
import Table from 'web/pages/permissions/PermissionTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';

const PermissionToolBarIcons = ({onPermissionCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-permissions"
        page="web-interface-access"
        title={_('Help: Permissions')}
      />
      {capabilities.mayCreate('permission') && (
        <NewIcon
          title={_('New Permission')}
          onClick={onPermissionCreateClick}
        />
      )}
    </IconDivider>
  );
};

PermissionToolBarIcons.propTypes = {
  onPermissionCreateClick: PropTypes.func,
};

const PermissionPage = ({onChanged, onDownloaded, onError, ...props}) => {
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
      {({clone, create, delete: delete_func, download, edit}) => (
        <>
          <PageTitle title={_('Permissions')} />
          <EntitiesPage
            {...props}
            filterEditDialog={PermissionFilterDialog}
            filtersFilter={PERMISSIONS_FILTER_FILTER}
            sectionIcon={<PermissionIcon size="large" />}
            table={Table}
            title={_('Permissions')}
            toolBarIcons={PermissionToolBarIcons}
            onError={onError}
            onPermissionCloneClick={clone}
            onPermissionCreateClick={create}
            onPermissionDeleteClick={delete_func}
            onPermissionDownloadClick={download}
            onPermissionEditClick={edit}
          />
        </>
      )}
    </PermissionComponent>
  );
};

PermissionPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('permission', {
  entitiesSelector,
  loadEntities,
})(PermissionPage);
