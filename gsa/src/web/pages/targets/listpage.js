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

import {TARGETS_FILTER_FILTER} from 'gmp/models/filter';

import {hasValue} from 'gmp/utils/identity';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import TargetIcon from 'web/components/icon/targeticon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import useReload from 'web/components/loading/useReload';

import EntitiesPage from 'web/entities/page';
import usePagination from 'web/entities/usePagination';

import {useLazyGetTargets} from 'web/graphql/targets';

import PropTypes from 'web/utils/proptypes';
import useChangeFilter from 'web/utils/useChangeFilter';
import useDefaultReloadInterval from 'web/utils/useDefaultReloadInterval';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import withCapabilities from 'web/utils/withCapabilities';

import TargetsFilterDialog from './filterdialog';
import TargetsTable from './table';
import TargetComponent from './component';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onTargetCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-targets"
        title={_('Help: Targets')}
      />
      {capabilities.mayCreate('target') && (
        <NewIcon title={_('New Target')} onClick={onTargetCreateClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onTargetCreateClick: PropTypes.func.isRequired,
};

const TargetsPage = () => {
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('target');
  const prevFilter = usePrevious(filter);
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('target');
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

  // Target list state variables and methods
  const [
    getTargets,
    {counts, targets, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetTargets();

  const timeoutFunc = useDefaultReloadInterval();

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

  // Side effects
  useEffect(() => {
    // load targets initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getTargets({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getTargets, called]);
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
    // start reloading if targets are available and no timer is running yet
    if (hasValue(targets) && !hasRunningTimer) {
      startReload();
    }
  }, [targets, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);
  return (
    <TargetComponent
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
          <PageTitle title={_('Targets')} />
          <EntitiesPage
            entities={targets}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={TargetsFilterDialog}
            filtersFilter={TARGETS_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            selectionType={selectionType}
            sectionIcon={<TargetIcon size="large" />}
            sortBy={sortBy}
            sortDir={sortDir}
            table={TargetsTable}
            title={_('Targets')}
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
            onTargetCloneClick={clone}
            onTargetCreateClick={create}
            onTargetDeleteClick={delete_func}
            onTargetDownloadClick={download}
            onTargetEditClick={edit}
            onTargetSaveClick={save}
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
    </TargetComponent>
  );
};

export default TargetsPage;

// vim: set ts=2 sw=2 tw=80:
