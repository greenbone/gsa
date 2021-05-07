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
import React, {useCallback, useEffect, useState} from 'react';

import _ from 'gmp/locale';

import {hasValue} from 'gmp/utils/identity';

import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';

import DashboardControls from 'web/components/dashboard/controls';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import OverrideIcon from 'web/components/icon/overrideicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import useExportEntity from 'web/entity/useExportEntity';
import {
  BulkTagComponent,
  useBulkDeleteEntities,
  useBulkExportEntities,
} from 'web/entities/bulkactions';
import EntitiesPage from 'web/entities/page';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import usePagination from 'web/entities/usePagination';

import {
  useLazyGetOverrides,
  useExportOverridesByFilter,
  useExportOverridesByIds,
  useDeleteOverridesByIds,
  useDeleteOverridesByFilter,
  useCloneOverride,
  useDeleteOverride,
} from 'web/graphql/overrides';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';
import useChangeFilter from 'web/utils/useChangeFilter';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import FilterDialog from './filterdialog';
import OverridesTable from './table';
import OverrideComponent from './component';

import OverridesDashboard, {OVERRIDES_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = ({onOverrideCreateClick}) => {
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="managing-overrides"
        title={_('Help: Overrides')}
      />

      {capabilities.mayCreate('override') && (
        <NewIcon title={_('New Override')} onClick={onOverrideCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onOverrideCreateClick: PropTypes.func.isRequired,
};

const Page = () => {
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('override');
  const prevFilter = usePrevious(filter);
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('override');
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

  // Override list state variables and methods
  const [
    getOverrides,
    {counts, overrides, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetOverrides();

  const exportEntity = useExportEntity();

  const [cloneOverride] = useCloneOverride();
  const [deleteOverride] = useDeleteOverride();
  const exportOverride = useExportOverridesByIds();

  const timeoutFunc = useEntitiesReloadInterval(overrides);

  const exportOverridesByFilter = useExportOverridesByFilter();
  const exportOverridesByIds = useExportOverridesByIds();
  const bulkExportOverrides = useBulkExportEntities();

  const [deleteOverridesByIds] = useDeleteOverridesByIds();
  const [deleteOverridesByFilter] = useDeleteOverridesByFilter();

  const bulkDeleteOverrides = useBulkDeleteEntities();

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

  // Override methods
  const handleDownloadOverride = exportedOverride => {
    exportEntity({
      entity: exportedOverride,
      exportFunc: exportOverride,
      resourceType: 'overrides',
      onDownload: handleDownload,
      showError,
    });
  };

  const handleCloneOverride = useCallback(
    override => cloneOverride(override.id).then(refetch, showError),
    [cloneOverride, refetch, showError],
  );

  const handleDeleteOverride = useCallback(
    override => deleteOverride(override.id).then(refetch, showError),
    [deleteOverride, refetch, showError],
  );

  // Bulk action methods
  const openTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(true);
  };

  const closeTagsDialog = () => {
    renewSessionTimeout();
    setTagsDialogVisible(false);
  };

  const handleBulkDeleteOverrides = () => {
    return bulkDeleteOverrides({
      selectionType,
      filter,
      selected,
      entities: overrides,
      deleteByIdsFunc: deleteOverridesByIds,
      deleteByFilterFunc: deleteOverridesByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportOverrides = () => {
    return bulkExportOverrides({
      entities: overrides,
      selected,
      filter,
      resourceType: 'overrides',
      selectionType,
      exportByFilterFunc: exportOverridesByFilter,
      exportByIdsFunc: exportOverridesByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  useEffect(() => {
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getOverrides({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getOverrides, called]);

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
    // start reloading if overrides are available and no timer is running yet
    if (hasValue(overrides) && !hasRunningTimer) {
      startReload();
    }
  }, [overrides, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);

  return (
    <OverrideComponent
      onCloned={refetch}
      onCloneError={showError}
      onCreated={refetch}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={refetch}
    >
      {({create, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Overrides')} />
          <EntitiesPage
            dashboard={() => (
              <OverridesDashboard
                filter={filter}
                onFilterChanged={changeFilter}
                onInteraction={renewSessionTimeout}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={OVERRIDES_DASHBOARD_ID}
                onInteraction={renewSessionTimeout}
              />
            )}
            entities={overrides}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={FilterDialog}
            filtersFilter={OVERRIDES_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            sectionIcon={<OverrideIcon size="large" />}
            selectionType={selectionType}
            sortBy={sortBy}
            sortDir={sortDir}
            table={OverridesTable}
            title={_('Overrides')}
            toolBarIcons={ToolBarIcons}
            onChanged={refetch}
            onDeleteBulk={handleBulkDeleteOverrides}
            onDownloadBulk={handleBulkExportOverrides}
            onDownloaded={handleDownload}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSessionTimeout}
            onOverrideCloneClick={handleCloneOverride}
            onOverrideCreateClick={create}
            onOverrideDeleteClick={handleDeleteOverride}
            onOverrideDownloadClick={handleDownloadOverride}
            onOverrideEditClick={edit}
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
              entities={overrides}
              selected={selected}
              filter={filter}
              selectionType={selectionType}
              entitiesCounts={counts}
              onClose={closeTagsDialog}
            />
          )}
        </React.Fragment>
      )}
    </OverrideComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
