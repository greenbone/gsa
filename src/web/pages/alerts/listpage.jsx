/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {ALERTS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import AlertIcon from 'web/components/icon/alerticon';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/alerts';

import AlertComponent from './component';
import AlertTable, {SORT_FIELDS} from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onAlertCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-alerts"
        title={_('Help: Alerts')}
      />
      {capabilities.mayCreate('alert') && (
        <NewIcon title={_('New Alert')} onClick={onAlertCreateClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onAlertCreateClick: PropTypes.func.isRequired,
};

const AlertFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const AlertsPage = ({
  showError,
  showSuccess,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <AlertComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
    onTestSuccess={showSuccess}
    onTestError={showError}
  >
    {({clone, create, delete: delete_func, download, edit, save, test}) => (
      <React.Fragment>
        <PageTitle title={_('Alerts')} />
        <EntitiesPage
          {...props}
          filterEditDialog={AlertFilterDialog}
          filtersFilter={ALERTS_FILTER_FILTER}
          sectionIcon={<AlertIcon size="large" />}
          table={AlertTable}
          title={_('Alerts')}
          toolBarIcons={ToolBarIcons}
          onAlertCloneClick={clone}
          onAlertCreateClick={create}
          onAlertDeleteClick={delete_func}
          onAlertDownloadClick={download}
          onAlertEditClick={edit}
          onAlertTestClick={test}
          onAlertSaveClick={save}
          onError={onError}
          onInteraction={onInteraction}
          onPermissionChanged={onChanged}
          onPermissionDownloaded={onDownloaded}
          onPermissionDownloadError={onError}
        />
      </React.Fragment>
    )}
  </AlertComponent>
);

AlertsPage.propTypes = {
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('alert', {
  entitiesSelector,
  loadEntities,
})(AlertsPage);

// vim: set ts=2 sw=2 tw=80:
