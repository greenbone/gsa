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
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import FilterDialog from 'web/pages/permissions/FilterDialog';
import PermissionComponent from 'web/pages/permissions/PermissionsComponent';
import Table from 'web/pages/permissions/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({onPermissionCreateClick}) => {
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

ToolBarIcons.propTypes = {
  onPermissionCreateClick: PropTypes.func,
};

const Page = ({onChanged, onDownloaded, onError, onInteraction, ...props}) => {
  const [_] = useTranslation();
  return (
    <PermissionComponent
      onCloneError={onError}
      onCloned={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaveError={onError}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Permissions')} />
          <EntitiesPage
            {...props}
            filterEditDialog={FilterDialog}
            filtersFilter={PERMISSIONS_FILTER_FILTER}
            sectionIcon={<PermissionIcon size="large" />}
            table={Table}
            title={_('Permissions')}
            toolBarIcons={ToolBarIcons}
            onError={onError}
            onInteraction={onInteraction}
            onPermissionCloneClick={clone}
            onPermissionCreateClick={create}
            onPermissionDeleteClick={delete_func}
            onPermissionDownloadClick={download}
            onPermissionEditClick={edit}
          />
        </React.Fragment>
      )}
    </PermissionComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('permission', {
  entitiesSelector,
  loadEntities,
})(Page);
