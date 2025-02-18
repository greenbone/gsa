/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {ALERTS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import {useTranslation} from 'react-i18next';
import AlertIcon from 'web/components/icon/AlertIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import NewIcon from 'web/components/icon/NewIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import AlertsFilterDialog from 'web/pages/alerts/FilterDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/alerts';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

import AlertComponent from './Component';
import AlertTable from './Table';

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
