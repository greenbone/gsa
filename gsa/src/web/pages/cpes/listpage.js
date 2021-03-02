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

import Filter, {CPES_FILTER_FILTER} from 'gmp/models/filter';
import {hasValue} from 'gmp/utils/identity';

import EntitiesPage from 'web/entities/page';

import DashboardControls from 'web/components/dashboard/controls';

import CpeLogoIcon from 'web/components/icon/cpelogoicon';
import ManualIcon from 'web/components/icon/manualicon';
import PageTitle from 'web/components/layout/pagetitle';
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
  useExportCpesByFilter,
  useExportCpesByIds,
  useLazyGetCpes,
} from 'web/graphql/cpes';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useChangeFilter from 'web/utils/useChangeFilter';
import useSelection from 'web/utils/useSelection';
import useFilterSortBy from 'web/utils/useFilterSortby';

import CpeFilterDialog from './filterdialog';
import CpesTable from './table';

import CpesDashboard, {CPES_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = props => (
  <ManualIcon page="managing-secinfo" anchor="cpe" title={_('Help: CPEs')} />
);

const fallbackFilter = Filter.fromString('sort-reverse=modified');

const CpesPage = () => {
  // Page methods and hooks
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  // Powerfilter
  const [filter, isLoadingFilter] = usePageFilter('cpe', {fallbackFilter});
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('cpe');
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

  // Cpe list state variables and methods
  const [
    getCpes,
    {counts, cpes, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetCpes();

  const exportCpesByFilter = useExportCpesByFilter();
  const exportCpesByIds = useExportCpesByIds();
  const bulkExportCpes = useBulkExportEntities();

  const timeoutFunc = useEntitiesReloadInterval(cpes);

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

  // No Cpe methods ?

  // Bulk action methods
  const openTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(true);
  };

  const closeTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(false);
  };

  const handleBulkExportCpes = () => {
    return bulkExportCpes({
      entities: cpes,
      selected,
      filter,
      resourceType: 'cpes',
      selectionType,
      exportByFilterFunc: exportCpesByFilter,
      exportByIdsFunc: exportCpesByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load cpes initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getCpes({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getCpes, called]);

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
    // start reloading if cpes are available and no timer is running yet
    if (hasValue(cpes) && !hasRunningTimer) {
      startReload();
    }
  }, [cpes, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);

  return (
    <React.Fragment>
      <PageTitle title={_('CPEs')} />
      <EntitiesPage
        createFilterType="info"
        dashboard={() => (
          <CpesDashboard
            filter={filter}
            onError={showError}
            onFilterChanged={changeFilter}
            onInteraction={renewSessionTimeout}
          />
        )}
        dashboardControls={() => (
          <DashboardControls
            dashboardId={CPES_DASHBOARD_ID}
            onInteraction={renewSessionTimeout}
          />
        )}
        entities={cpes}
        entitiesCounts={counts}
        entitiesError={error}
        entitiesSelected={selected}
        filter={filter}
        filterEditDialog={CpeFilterDialog}
        filtersFilter={CPES_FILTER_FILTER}
        isLoading={isLoading}
        isUpdating={isLoading}
        sectionIcon={<CpeLogoIcon size="large" />}
        selectionType={selectionType}
        sortBy={sortBy}
        sortDir={sortDir}
        table={CpesTable}
        title={_('CPEs')}
        toolBarIcons={ToolBarIcons}
        onChanged={refetch}
        onDownloadBulk={handleBulkExportCpes}
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
          entities={cpes}
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

export default CpesPage;

// vim: set ts=2 sw=2 tw=80:
