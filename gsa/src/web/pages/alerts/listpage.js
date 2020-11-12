/* Copyright (C) 2017-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useEffect, useCallback, useState} from 'react';

import _ from 'gmp/locale';

import {ALERTS_FILTER_FILTER} from 'gmp/models/filter';

import {hasValue} from 'gmp/utils/identity.js';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities.js';

import EntitiesPage from 'web/entities/page.js';
import withEntitiesContainer from 'web/entities/withEntitiesContainer.js';

import ManualIcon from 'web/components/icon/manualicon.js';
import NewIcon from 'web/components/icon/newicon.js';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import AlertIcon from 'web/components/icon/alerticon';

import {createFilterDialog} from 'web/components/powerfilter/dialog.js';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import useReload from 'web/components/loading/useReload.js';
import useDownload from 'web/components/form/useDownload.js';
import Download from 'web/components/form/download.js';

import {
  useLazyGetAlerts,
  useCloneAlert,
  useDeleteAlert,
  useTestAlert,
  useDeleteAlertsByFilter,
  useDeleteAlertsByIds,
  useExportAlertsByFilter,
  useExportAlertsByIds,
} from 'web/graphql/alerts';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/alerts';
import {
  BulkTagComponent,
  useBulkDeleteEntities,
  useBulkExportEntities,
} from 'web/entities/bulkactions.js';
import {usePagination} from 'web/entities/usePagination.js';

import usePageFilter from 'web/utils/usePageFilter.js';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout.js';
import useGmpSettings from 'web/utils/useGmpSettings.js';
import usePrevious from 'web/utils/usePrevious.js';
import useChangeFilter from 'web/utils/useChangeFilter.js';
import useFilterSortBy from 'web/utils/useFilterSortby.js';
import useSelection from 'web/utils/useSelection.js';

import AlertComponent from './component.js';
import AlertTable, {SORT_FIELDS} from './table.js';

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

const AlertsPage = ({onChanged, onDownloaded, onError, ...props}) => {
  // Page methods and hooks
  const gmpSettings = useGmpSettings();
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSession] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('alert');
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('alert');
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
    showSuccess,
  } = useDialogNotification();
  const {
    selectionType,
    selected = [],
    changeSelectionType,
    select,
    deselect,
  } = useSelection();
  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );
  const [tagsDialogVisible, setTagsDialogVisible] = useState(false);

  // Alert list state variables and methods
  const [
    getAlerts,
    {counts, alerts, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetAlerts();

  const [cloneAlert] = useCloneAlert();
  const [deleteAlert] = useDeleteAlert();
  const [testAlert] = useTestAlert();

  const exportAlertsByFilter = useExportAlertsByFilter();
  const exportAlertsByIds = useExportAlertsByIds();
  const bulkExportAlerts = useBulkExportEntities();

  const [deleteAlertsByIds] = useDeleteAlertsByIds();
  const [deleteAlertsByFilter] = useDeleteAlertsByFilter();

  const bulkDeleteAlerts = useBulkDeleteEntities();

  const timeoutFunc = useCallback(
    ({isVisible}) => {
      if (!isVisible) {
        return gmpSettings.reloadIntervalInactive;
      }
      if (hasValue(alerts) && alerts.some(alert => alert.isActive())) {
        return gmpSettings.reloadIntervalActive;
      }
      return gmpSettings.reloadInterval;
    },
    [alerts, gmpSettings],
  );

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  // Pagination methods
  const [getFirst, getLast, getNext, getPrevious] = usePagination({
    simpleFilter,
    filter,
    pageInfo,
    refetch,
  });

  // Alert methods
  const handleCloneAlert = useCallback(
    alert => cloneAlert(alert.id).then(refetch, showError),
    [cloneAlert, refetch, showError],
  );
  const handleDeleteAlert = useCallback(
    alert => deleteAlert(alert.id).then(refetch, showError),
    [deleteAlert, refetch, showError],
  );
  const handleTestAlert = useCallback(
    alert => testAlert(alert.id).then(showSuccess, showError),
    [testAlert, showError, showSuccess],
  );

  // Bulk action methods
  const openTagsDialog = () => {
    renewSession();
    setTagsDialogVisible(true);
  };

  const closeTagsDialog = () => {
    renewSession();
    setTagsDialogVisible(false);
  };

  const handleBulkDeleteAlerts = () => {
    return bulkDeleteAlerts({
      selectionType,
      filter,
      selected,
      entities: alerts,
      deleteByIdsFunc: deleteAlertsByIds,
      deleteByFilterFunc: deleteAlertsByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportAlerts = () => {
    return bulkExportAlerts({
      entities: alerts,
      selected,
      filter,
      resourceType: 'alerts',
      selectionType,
      exportByFilterFunc: exportAlertsByFilter,
      exportByIdsFunc: exportAlertsByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load alerts initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getAlerts({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getAlerts, called]);
  useEffect(() => {
    // reload if filter has changed
    if (hasValue(refetch) && !filter.equals(prevFilter)) {
      refetch({
        filterString: filter.toFilterString(),
        first: undefined,
        last: undefined,
      });
    }
  }, [filter, prevFilter, simpleFilter, refetch]);

  useEffect(() => {
    // start reloading if alerts are available and no timer is running yet
    if (hasValue(alerts) && !hasRunningTimer) {
      startReload();
    }
  }, [alerts, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);
  return (
    <AlertComponent
      onCreated={refetch}
      onSaved={refetch}
      onCloned={refetch}
      onCloneError={onError}
      onDeleted={refetch}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={renewSession}
      onTestSuccess={showSuccess}
      onTestError={showError}
    >
      {({create, download, edit, save}) => (
        <React.Fragment>
          <PageTitle title={_('Alerts')} />
          <EntitiesPage
            {...props}
            entities={alerts}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={AlertFilterDialog}
            filtersFilter={ALERTS_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            selectionType={selectionType}
            sectionIcon={<AlertIcon size="large" />}
            sortBy={sortBy}
            sortDir={sortDir}
            table={AlertTable}
            title={_('Alerts')}
            toolBarIcons={ToolBarIcons}
            onAlertCloneClick={handleCloneAlert}
            onAlertCreateClick={create}
            onAlertDeleteClick={handleDeleteAlert}
            onAlertDownloadClick={download}
            onAlertEditClick={edit}
            onAlertTestClick={handleTestAlert}
            onAlertSaveClick={save}
            onDeleteBulk={handleBulkDeleteAlerts}
            onDownloadBulk={handleBulkExportAlerts}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={onError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSession}
            onPermissionChanged={onChanged}
            onPermissionDownloaded={onDownloaded}
            onPermissionDownloadError={onError}
            onSortChange={handleSortChange}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={changeSelectionType}
            onTagsBulk={openTagsDialog}
          />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
          <Download ref={downloadRef} />
          {tagsDialogVisible && (
            <BulkTagComponent
              entities={alerts}
              selected={selected}
              filter={filter}
              selectionType={selectionType}
              entitiesCounts={counts}
              onClose={closeTagsDialog}
            />
          )}
        </React.Fragment>
      )}
    </AlertComponent>
  );
};

AlertsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default AlertsPage;

// vim: set ts=2 sw=2 tw=80:
