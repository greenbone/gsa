/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {ALERTS_FILTER_FILTER} from 'gmp/models/filter';
import {AlertIcon, NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import AlertFilterDialog from 'web/pages/alerts/AlertFilterDialog';
import AlertTable from 'web/pages/alerts/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/alerts';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
export const ToolBarIcons = withCapabilities(
  ({capabilities, onAlertCreateClick}) => {
    const [_] = useTranslation();

    return (
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
    );
  },
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
      onSaved={onChanged}
      onTestError={showError}
      onTestSuccess={showSuccess}
    >
      {({clone, create, delete: delete_func, download, edit, save, test}) => (
        <>
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
            onAlertSaveClick={save}
            onAlertTestClick={test}
            onError={onError}
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
};

export default withEntitiesContainer('alert', {
  entitiesSelector,
  loadEntities,
})(AlertsPage);
