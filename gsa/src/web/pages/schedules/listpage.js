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
import React, {useEffect} from 'react';

import _ from 'gmp/locale';

import {SCHEDULES_FILTER_FILTER} from 'gmp/models/filter';
import {hasValue} from 'gmp/utils/identity';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScheduleIcon from 'web/components/icon/scheduleicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import EntitiesPage from 'web/entities/page';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import usePagination from 'web/entities/usePagination';

import {useLazyGetSchedules} from 'web/graphql/schedules';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';
import useChangeFilter from 'web/utils/useChangeFilter';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import ScheduleComponent from './component';
import SchedulesTable, {SORT_FIELDS} from './table';

export const ToolBarIcons = ({onScheduleCreateClick}) => {
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-schedules"
        title={_('Help: Schedules')}
      />
      {capabilities.mayCreate('schedule') && (
        <NewIcon title={_('New Schedule')} onClick={onScheduleCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onScheduleCreateClick: PropTypes.func.isRequired,
};

const ScheduleFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const SchedulesPage = () => {
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('schedule');
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('schedule');
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

  // Schedule list state variables and methods
  const [
    getSchedules,
    {counts, schedules, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetSchedules();

  const timeoutFunc = useEntitiesReloadInterval(schedules);

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

  // Side effects
  useEffect(() => {
    // load schedules initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getSchedules({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getSchedules, called]);
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
    // start reloading if schedules are available and no timer is running yet
    if (hasValue(schedules) && !hasRunningTimer) {
      startReload();
    }
  }, [schedules, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);

  return (
    <ScheduleComponent
      onCreated={refetch}
      onSaved={refetch}
      onCloned={refetch}
      onCloneError={showError}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <React.Fragment>
          <PageTitle title={_('Schedules')} />
          <EntitiesPage
            entities={schedules}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={ScheduleFilterDialog}
            filtersFilter={SCHEDULES_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            selectionType={selectionType}
            sectionIcon={<ScheduleIcon size="large" />}
            sortBy={sortBy}
            sortDir={sortDir}
            table={SchedulesTable}
            title={_('Schedules')}
            toolBarIcons={ToolBarIcons}
            onChanged={refetch}
            onDownloaded={handleDownload}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSessionTimeout}
            onScheduleCloneClick={clone}
            onScheduleCreateClick={create}
            onScheduleDeleteClick={delete_func}
            onScheduleDownloadClick={download}
            onScheduleEditClick={edit}
            onScheduleSaveClick={save}
            onSortChange={handleSortChange}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={changeSelectionType}
          />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
          <Download ref={downloadRef} />
        </React.Fragment>
      )}
    </ScheduleComponent>
  );
};

export default SchedulesPage;

// vim: set ts=2 sw=2 tw=80:
