/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import React, {useEffect, useState, useCallback} from 'react';

import _ from 'gmp/locale';

import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';
import {hasValue} from 'gmp/utils/identity';

import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';
import useDownload from 'web/components/form/useDownload';

import PageTitle from 'web/components/layout/pagetitle';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import DialogNotification from 'web/components/notification/dialognotification';
import Download from 'web/components/form/download';
import useReload from 'web/components/loading/useReload';

import EntitiesPage from 'web/entities/page';
import {
  BulkTagComponent,
  useBulkDeleteEntities,
  useBulkExportEntities,
} from 'web/entities/bulkactions';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  useCloneScanConfig,
  useDeleteScanConfig,
  useDeleteScanConfigsByFilter,
  useDeleteScanConfigsByIds,
  useExportScanConfigsByFilter,
  useExportScanConfigsByIds,
  useLazyGetScanConfigs,
} from 'web/graphql/scanconfigs';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';

import PropTypes from 'web/utils/proptypes';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useChangeFilter from 'web/utils/useChangeFilter';
import useSelection from 'web/utils/useSelection';
import useFilterSortBy from 'web/utils/useFilterSortby';
import useGmpSettings from 'web/utils/useGmpSettings';
import withCapabilities from 'web/utils/withCapabilities';

import ScanConfigComponent from './component';
import Table, {SORT_FIELDS} from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onScanConfigCreateClick, onScanConfigImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-scan-configurations"
        title={_('Help: Scan Configs')}
      />
      {capabilities.mayCreate('config') && (
        <NewIcon
          title={_('New Scan Config')}
          onClick={onScanConfigCreateClick}
        />
      )}
      {capabilities.mayCreate('config') && (
        <UploadIcon
          title={_('Import Scan Config')}
          onClick={onScanConfigImportClick}
        />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onScanConfigCreateClick: PropTypes.func.isRequired,
  onScanConfigImportClick: PropTypes.func.isRequired,
};

const ScanConfigFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const ScanConfigsPage = props => {
  // Page methods and hooks
  const gmpSettings = useGmpSettings();
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSession] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('scanconfig');
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('scanconfig');
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
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

  // ScanConfig list state variables and methods
  const [
    getScanConfigs,
    {counts, scanConfigs, error, loading: isLoading, refetch, called},
  ] = useLazyGetScanConfigs();

  const exportScanConfigsByFilter = useExportScanConfigsByFilter();
  const exportScanConfigsByIds = useExportScanConfigsByIds();
  const bulkExportScanConfigs = useBulkExportEntities();

  const [deleteScanConfig] = useDeleteScanConfig();
  const [deleteScanConfigsByIds] = useDeleteScanConfigsByIds();
  const [deleteScanConfigsByFilter] = useDeleteScanConfigsByFilter();
  const bulkDeleteScanConfigs = useBulkDeleteEntities();
  const [cloneScanConfig] = useCloneScanConfig();

  const timeoutFunc = useCallback(
    ({isVisible}) => {
      if (!isVisible) {
        return gmpSettings.reloadIntervalInactive;
      }
      return gmpSettings.reloadInterval;
    },
    [gmpSettings], // scanconfig does not have active field so it can't use the same function as the other entities
  );

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  // Pagination methods
  // usePagination does not work with this page yet. Not sure why. Keep withEntitiesContainer for now.

  // ScanConfig methods
  const handleCloneScanConfig = useCallback(
    scanConfig => cloneScanConfig(scanConfig.id).then(refetch, showError),
    [cloneScanConfig, refetch, showError],
  );
  const handleDeleteScanConfig = useCallback(
    scanConfig => deleteScanConfig(scanConfig.id).then(refetch, showError),
    [deleteScanConfig, refetch, showError],
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

  const handleBulkDeleteScanConfigs = () => {
    return bulkDeleteScanConfigs({
      selectionType,
      filter,
      selected,
      entities: scanConfigs,
      deleteByIdsFunc: deleteScanConfigsByIds,
      deleteByFilterFunc: deleteScanConfigsByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportScanConfigs = () => {
    return bulkExportScanConfigs({
      entities: scanConfigs,
      selected,
      filter,
      resourceType: 'scanConfigs',
      selectionType,
      exportByFilterFunc: exportScanConfigsByFilter,
      exportByIdsFunc: exportScanConfigsByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load scanConfigs initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getScanConfigs({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getScanConfigs, called]);

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
    // start reloading if scanConfigs are available and no timer is running yet
    if (hasValue(scanConfigs) && !hasRunningTimer) {
      startReload();
    }
  }, [scanConfigs, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);
  return (
    <ScanConfigComponent
      onCloned={refetch}
      onCloneError={showError}
      onCreated={refetch}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onImported={refetch}
      onInteraction={renewSession}
      onSaved={refetch}
    >
      {({create, download, edit, import: import_func}) => (
        <React.Fragment>
          <PageTitle title={_('Scan Configs')} />
          <EntitiesPage
            {...props}
            entities={scanConfigs}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={ScanConfigFilterDialog}
            filtersFilter={SCANCONFIGS_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            selectionType={selectionType}
            sectionIcon={<ScanConfigIcon size="large" />}
            sortBy={sortBy}
            sortDir={sortDir}
            table={Table}
            title={_('Scan Configs')}
            toolBarIcons={ToolBarIcons}
            onDeleteBulk={handleBulkDeleteScanConfigs}
            onDownloadBulk={handleBulkExportScanConfigs}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSession}
            onScanConfigImportClick={import_func}
            onScanConfigCloneClick={handleCloneScanConfig}
            onScanConfigCreateClick={create}
            onScanConfigDeleteClick={handleDeleteScanConfig}
            onScanConfigDownloadClick={download}
            onScanConfigEditClick={edit}
            onSortChange={handleSortChange}
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
              entities={scanConfigs}
              selected={selected}
              filter={filter}
              selectionType={selectionType}
              entitiesCounts={counts}
              onClose={closeTagsDialog}
            />
          )}
        </React.Fragment>
      )}
    </ScanConfigComponent>
  );
};

ScanConfigsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('scanconfig', {
  entitiesSelector,
  loadEntities,
})(ScanConfigsPage);

// vim: set ts=2 sw=2 tw=80:
