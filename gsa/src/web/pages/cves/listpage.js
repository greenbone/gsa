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

import Filter, {CVES_FILTER_FILTER} from 'gmp/models/filter';
import {hasValue} from 'gmp/utils/identity';

import DashboardControls from 'web/components/dashboard/controls';

import CveIcon from 'web/components/icon/cveicon';
import ManualIcon from 'web/components/icon/manualicon';
import PageTitle from 'web/components/layout/pagetitle';
import useDownload from 'web/components/form/useDownload';

import EntitiesPage from 'web/entities/page';
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
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  useExportCvesByFilter,
  useExportCvesByIds,
  useLazyGetCves,
} from 'web/graphql/cves';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cves';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useChangeFilter from 'web/utils/useChangeFilter';
import useSelection from 'web/utils/useSelection';
import useFilterSortBy from 'web/utils/useFilterSortby';

import CveFilterDialog from './filterdialog';
import CvesTable from './table';

import CvesDashboard, {CVES_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = () => (
  <ManualIcon page="managing-secinfo" anchor="cve" title={_('Help: CVEs')} />
);

const CvesPage = () => {
  // Page methods and hooks
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  // Powerfilter
  const [filter, isLoadingFilter] = usePageFilter('cve');
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('cve');
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

  // Cve list state variables and methods
  const [
    getCves,
    {counts, cves, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetCves();

  const exportCvesByFilter = useExportCvesByFilter();
  const exportCvesByIds = useExportCvesByIds();
  const bulkExportCves = useBulkExportEntities();

  const timeoutFunc = useEntitiesReloadInterval(cves);

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

  // No Cve methods ?

  // Bulk action methods
  const openTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(true);
  };

  const closeTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(false);
  };

  const handleBulkExportCves = () => {
    return bulkExportCves({
      entities: cves,
      selected,
      filter,
      resourceType: 'cves',
      selectionType,
      exportByFilterFunc: exportCvesByFilter,
      exportByIdsFunc: exportCvesByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load cves initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getCves({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getCves, called]);

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
    // start reloading if cves are available and no timer is running yet
    if (hasValue(cves) && !hasRunningTimer) {
      startReload();
    }
  }, [cves, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);

  return (
    <React.Fragment>
      <PageTitle title={_('CVEs')} />
      <EntitiesPage
        dashboard={() => (
          <CvesDashboard
            filter={filter}
            onError={showError}
            onFilterChanged={changeFilter}
            onInteraction={renewSessionTimeout}
          />
        )}
        dashboardControls={() => (
          <DashboardControls
            dashboardId={CVES_DASHBOARD_ID}
            onInteraction={renewSessionTimeout}
          />
        )}
        entities={cves}
        entitiesCounts={counts}
        entitiesError={error}
        entitiesSelected={selected}
        filter={filter}
        filterEditDialog={CveFilterDialog}
        filtersFilter={CVES_FILTER_FILTER}
        isLoading={isLoading}
        isUpdating={isLoading}
        sectionIcon={<CveIcon size="large" />}
        selectionType={selectionType}
        sortBy={sortBy}
        sortDir={sortDir}
        table={CvesTable}
        title={_('CVEs')}
        toolBarIcons={ToolBarIcons}
        onChanged={refetch}
        onDownloadBulk={handleBulkExportCves}
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
          entities={cves}
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

const fallbackFilter = Filter.fromString('sort-reverse=name');

export default withEntitiesContainer('cve', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(CvesPage);

// vim: set ts=2 sw=2 tw=80:
