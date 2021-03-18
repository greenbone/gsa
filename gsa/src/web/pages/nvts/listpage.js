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
import React, {useEffect, useState} from 'react';

import _ from 'gmp/locale';

import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import {hasValue} from 'gmp/utils/identity';

import EntitiesPage from 'web/entities/page';

import DashboardControls from 'web/components/dashboard/controls';
import PageTitle from 'web/components/layout/pagetitle';

import ManualIcon from 'web/components/icon/manualicon';
import NvtIcon from 'web/components/icon/nvticon';

import useDownload from 'web/components/form/useDownload';

import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import usePagination from 'web/entities/usePagination';

import useDialogNotification from 'web/components/notification/useDialogNotification';

import DialogNotification from 'web/components/notification/dialognotification';
import Download from 'web/components/form/download';
import useReload from 'web/components/loading/useReload';

import {
  BulkTagComponent,
  useBulkExportEntities,
} from 'web/entities/bulkactions';

import {
  useExportNvtsByFilter,
  useExportNvtsByIds,
  useLazyGetNvts,
} from 'web/graphql/nvts';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useChangeFilter from 'web/utils/useChangeFilter';
import useSelection from 'web/utils/useSelection';
import useFilterSortBy from 'web/utils/useFilterSortby';

import NvtsFilterDialog from './filterdialog';
import NvtsTable from './table';

import NvtsDashboard, {NVTS_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = () => (
  <ManualIcon
    page="managing-secinfo"
    anchor="network-vulnerability-tests-nvt"
    title={_('Help: NVTs')}
  />
);

const fallbackFilter = Filter.fromString('sort-reverse=created');

const NvtsPage = () => {
  // Page methods and hooks
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  // Powerfilter
  const [filter, isLoadingFilter] = usePageFilter('nvt', {fallbackFilter});
  const prevFilter = usePrevious(filter);
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('nvt');
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

  // Nvt list state variables and methods
  const [
    getNvts,
    {counts, nvts, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetNvts();

  const exportNvtsByFilter = useExportNvtsByFilter();
  const exportNvtsByIds = useExportNvtsByIds();
  const bulkExportNvts = useBulkExportEntities();

  const timeoutFunc = useEntitiesReloadInterval(nvts);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  // Pagination methods
  const [getFirst, getLast, getNext, getPrevious] = usePagination({
    filter,
    pageInfo,
    refetch,
  });

  // Bulk action methods
  const openTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(true);
  };

  const closeTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(false);
  };

  const handleBulkExportNvts = () => {
    return bulkExportNvts({
      entities: nvts,
      selected,
      filter,
      resourceType: 'nvts',
      selectionType,
      exportByFilterFunc: exportNvtsByFilter,
      exportByIdsFunc: exportNvtsByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load nvts initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getNvts({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getNvts, called]);

  useEffect(() => {
    // reload if filter has changed
    if (hasValue(refetch) && !filter.equals(prevFilter)) {
      refetch({
        filterString: filter.toFilterString(),
        first: undefined,
        last: undefined,
      });
    }
  }, [filter, prevFilter, refetch]);

  useEffect(() => {
    // start reloading if nvts are available and no timer is running yet
    if (hasValue(nvts) && !hasRunningTimer) {
      startReload();
    }
  }, [nvts, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);

  return (
    <React.Fragment>
      <PageTitle title={_('NVTs')} />
      <EntitiesPage
        createFilterType="info"
        dashboard={() => (
          <NvtsDashboard
            filter={filter}
            onFilterChanged={changeFilter}
            onInteraction={renewSessionTimeout}
          />
        )}
        dashboardControls={() => (
          <DashboardControls
            dashboardId={NVTS_DASHBOARD_ID}
            onInteraction={renewSessionTimeout}
          />
        )}
        entities={nvts}
        entitiesCounts={counts}
        entitiesError={error}
        entitiesSelected={selected}
        filter={filter}
        filterEditDialog={NvtsFilterDialog}
        filtersFilter={NVTS_FILTER_FILTER}
        isLoading={isLoading}
        isUpdating={isLoading}
        sectionIcon={<NvtIcon size="large" />}
        selectionType={selectionType}
        sortBy={sortBy}
        sortDir={sortDir}
        table={NvtsTable}
        title={_('NVTs')}
        toolBarIcons={ToolBarIcons}
        onChanged={refetch}
        onDownloadBulk={handleBulkExportNvts}
        onDownloaded={handleDownload}
        onEntitySelected={select}
        onEntityDeselected={deselect}
        onError={showError}
        onFilterChanged={changeFilter}
        onFilterCreated={changeFilter}
        onFilterReset={resetFilter}
        onFilterRemoved={removeFilter}
        onInteraction={renewSessionTimeout}
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
          entities={nvts}
          selected={selected}
          filter={filter}
          selectionType={selectionType}
          entitiesCounts={counts}
          onClose={closeTagsDialog}
        />
      )}
    </React.Fragment>
  );
};

export default NvtsPage;

// vim: set ts=2 sw=2 tw=80:
