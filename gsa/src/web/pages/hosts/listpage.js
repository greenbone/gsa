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
import React, {useCallback, useEffect} from 'react';
import {useHistory} from 'react-router-dom';

import _ from 'gmp/locale';

import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';

import {hasValue} from 'gmp/utils/identity';

import DashboardControls from 'web/components/dashboard/controls';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import HostIcon from 'web/components/icon/hosticon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import {
  useBulkDeleteEntities,
  useBulkExportEntities,
} from 'web/entities/bulkactions';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import useExportEntity from 'web/entity/useExportEntity';

import {
  useDeleteHost,
  useDeleteHostsByFilter,
  useDeleteHostsByIds,
  useExportHostsByFilter,
  useExportHostsByIds,
  useLazyGetHosts,
} from 'web/graphql/hosts';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/hosts';

import {goto_entity_details} from 'web/utils/graphql';
import PropTypes from 'web/utils/proptypes';

import useCapabilities from 'web/utils/useCapabilities';
import useChangeFilter from 'web/utils/useChangeFilter';
import useDefaultReloadInterval from 'web/utils/useDefaultReloadInterval';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import HostsFilterDialog from './filterdialog';
import HostsTable from './table';
import HostComponent from './component';

import HostsDashboard, {HOSTS_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = ({onHostCreateClick}) => {
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        page="managing-assets"
        anchor="managing-hosts"
        title={_('Help: Hosts')}
      />
      {capabilities.mayCreate('host') && (
        <NewIcon title={_('New Host')} onClick={onHostCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onHostCreateClick: PropTypes.func.isRequired,
};

const Page = props => {
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('host');
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('host');
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
  const history = useHistory();

  // host list state variables and methods
  const [
    getHosts,
    {counts, hosts, error, loading: isLoading, refetch, called},
  ] = useLazyGetHosts();

  const exportEntity = useExportEntity();

  const [deleteHost] = useDeleteHost();
  const exportHost = useExportHostsByIds();

  const exportHostsByFilter = useExportHostsByFilter();
  const bulkExportHosts = useBulkExportEntities();

  const [deleteHostsByIds] = useDeleteHostsByIds();
  const exportHostsByIds = useExportHostsByIds();
  const [deleteHostsByFilter] = useDeleteHostsByFilter();

  const bulkDeleteHosts = useBulkDeleteEntities();

  const timeoutFunc = useDefaultReloadInterval();

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  // Host methods
  const handleDownloadHost = exportedHost => {
    exportEntity({
      entity: exportedHost,
      exportFunc: exportHost,
      resourceType: 'hosts',
      onDownload: handleDownload,
      showError,
    });
  };

  const handleDeleteHost = useCallback(
    host => deleteHost(host.id).then(refetch, showError),
    [deleteHost, refetch, showError],
  );

  // Bulk action methods
  const handleBulkDeleteHosts = () => {
    return bulkDeleteHosts({
      selectionType,
      filter,
      selected,
      entities: hosts,
      deleteByIdsFunc: deleteHostsByIds,
      deleteByFilterFunc: deleteHostsByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportHosts = () => {
    return bulkExportHosts({
      entities: hosts,
      selected,
      filter,
      resourceType: 'hosts',
      selectionType,
      exportByFilterFunc: exportHostsByFilter,
      exportByIdsFunc: exportHostsByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load hosts initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getHosts({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getHosts, called]);
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
    // start reloading if hosts are available and no timer is running yet
    if (hasValue(hosts) && !hasRunningTimer) {
      startReload();
    }
  }, [hosts, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);
  return (
    <HostComponent
      entitiesCounts={counts}
      onTargetCreated={goto_entity_details('target', {history})}
      onTargetCreateError={showError}
      onCreated={refetch}
      onDeleted={refetch}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={refetch}
    >
      {({create, createtargetfromselection, createtargetfromhost, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Hosts')} />
          <EntitiesPage
            {...props}
            dashboard={() => (
              <HostsDashboard
                filter={filter}
                onFilterChanged={changeFilter}
                onInteraction={renewSessionTimeout}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={HOSTS_DASHBOARD_ID}
                onInteraction={renewSessionTimeout}
              />
            )}
            entities={hosts}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={HostsFilterDialog}
            filtersFilter={HOSTS_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            selectionType={selectionType}
            sectionIcon={<HostIcon size="large" />}
            sortBy={sortBy}
            sortDir={sortDir}
            table={HostsTable}
            title={_('Hosts')}
            toolBarIcons={ToolBarIcons}
            onDeleteBulk={handleBulkDeleteHosts}
            onDownloadBulk={handleBulkExportHosts}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onHostCreateClick={create}
            onHostDeleteClick={handleDeleteHost}
            onHostDownloadClick={handleDownloadHost}
            onHostEditClick={edit}
            onInteraction={renewSessionTimeout}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
            onTargetCreateFromSelection={createtargetfromselection}
            onTargetCreateFromHostClick={createtargetfromhost}
          />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
          <Download ref={downloadRef} />
        </React.Fragment>
      )}
    </HostComponent>
  );
};

export default withEntitiesContainer('host', {
  entitiesSelector,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
