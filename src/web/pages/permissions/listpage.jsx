/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {PERMISSIONS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import PermissionIcon from 'web/components/icon/permissionicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/permissions';

import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

import Table from './table';
import PermissionComponent from './component';
import FilterDialog from 'web/pages/permissions/filterdialog';

const ToolBarIcons = ({onPermissionCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        page="web-interface-access"
        anchor="managing-permissions"
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
      onCloned={onChanged}
      onCloneError={onError}
      onDeleted={onChanged}
      onDeleteError={onError}
      onSaved={onChanged}
      onSaveError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={onInteraction}
    >
      {({clone, create, delete: delete_func, download, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Permissions')} />
          <EntitiesPage
            {...props}
            sectionIcon={<PermissionIcon size="large" />}
            table={Table}
            filterEditDialog={FilterDialog}
            filtersFilter={PERMISSIONS_FILTER_FILTER}
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

// vim: set ts=2 sw=2 tw=80:
