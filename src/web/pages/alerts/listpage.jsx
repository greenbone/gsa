/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {ALERTS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import {useTranslation} from 'react-i18next';
import AlertIcon from 'web/components/icon/alerticon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import AlertsFilterDialog from 'web/pages/alerts/filterdialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/alerts';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import AlertComponent from './component';
import AlertTable from './table';


export const ToolBarIcons = withCapabilities(
  ({capabilities, onAlertCreateClick}) => (
    <IconDivider>
      <ManualIcon
        anchor="managing-alerts"
        page="scanning"
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

const AlertsPage = ({
  showError,
  showSuccess,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <AlertComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
      onTestError={showError}
      onTestSuccess={showSuccess}
    >
      {({clone, create, delete: delete_func, download, edit, save, test}) => (
        <>
          <PageTitle title={_('Alerts')} />
          <EntitiesPage
            {...props}
            filterEditDialog={AlertsFilterDialog}
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
            onAlertSaveClick={save}
            onAlertTestClick={test}
            onError={onError}
            onInteraction={onInteraction}
            onPermissionChanged={onChanged}
            onPermissionDownloadError={onError}
            onPermissionDownloaded={onDownloaded}
          />
        </>
      )}
    </AlertComponent>
  );
};

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
