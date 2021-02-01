/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {RESET_FILTER, SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import {hasValue} from 'gmp/utils/identity';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import PolicyIcon from 'web/components/icon/policyicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';
import ManualIcon from 'web/components/icon/manualicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import {
  useBulkDeleteEntities,
  useBulkExportEntities,
} from 'web/entities/bulkactions';
import EntitiesPage from 'web/entities/page';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/policies';

import useExportEntity from 'web/entity/useExportEntity';

import {
  useClonePolicy,
  useDeletePolicy,
  useExportPoliciesByIds,
  useLazyGetPolicies,
  useExportPoliciesByFilter,
  useDeletePoliciesByIds,
  useDeletePoliciesByFilter,
} from 'web/graphql/policies';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import useChangeFilter from 'web/utils/useChangeFilter';
import usePrevious from 'web/utils/usePrevious';
import useReload from 'web/components/loading/useReload';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import PoliciesComponent from './component';
import Table from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onPolicyCreateClick, onPolicyImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="compliance-and-special-scans"
        anchor="configuring-and-managing-policies"
        title={_('Help: Policies')}
      />
      {capabilities.mayCreate('config') && (
        <NewIcon title={_('New Policy')} onClick={onPolicyCreateClick} />
      )}
      {capabilities.mayCreate('config') && (
        <UploadIcon title={_('Import Policy')} onClick={onPolicyImportClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onPolicyCreateClick: PropTypes.func.isRequired,
  onPolicyImportClick: PropTypes.func.isRequired,
};

const PoliciesPage = props => {
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('policy');
  const prevFilter = usePrevious(filter);
  const simpleFilter = filter.withoutView();
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('policy');
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

  // Policy list state variables and methods
  const [
    getPolicies,
    {counts, policies, error, loading: isLoading, refetch, called}, // like scan configs, pagination doesn't work with usePagination
  ] = useLazyGetPolicies();

  const exportEntity = useExportEntity();

  const [clonePolicy] = useClonePolicy();
  const [deletePolicy] = useDeletePolicy();
  const exportPolicy = useExportPoliciesByIds();

  const exportPoliciesByFilter = useExportPoliciesByFilter();
  const bulkExportPolicies = useBulkExportEntities();

  const [deletePoliciesByIds] = useDeletePoliciesByIds();
  const exportPoliciesByIds = useExportPoliciesByIds();
  const [deletePoliciesByFilter] = useDeletePoliciesByFilter();

  const bulkDeletePolicies = useBulkDeleteEntities();

  const timeoutFunc = useEntitiesReloadInterval(policies);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  // Policy methods
  const handleDownloadPolicy = exportedPolicy => {
    exportEntity({
      entity: exportedPolicy,
      exportFunc: exportPolicy,
      resourceType: 'policies',
      onDownload: handleDownload,
      showError,
    });
  };

  const handleClonePolicy = useCallback(
    policy => clonePolicy(policy.id).then(refetch, showError),
    [clonePolicy, refetch, showError],
  );
  const handleDeletePolicy = useCallback(
    policy => deletePolicy(policy.id).then(refetch, showError),
    [deletePolicy, refetch, showError],
  );

  // Bulk action methods
  const handleBulkDeletePolicies = () => {
    return bulkDeletePolicies({
      selectionType,
      filter,
      selected,
      entities: policies,
      deleteByIdsFunc: deletePoliciesByIds,
      deleteByFilterFunc: deletePoliciesByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportPolicies = () => {
    return bulkExportPolicies({
      entities: policies,
      selected,
      filter,
      resourceType: 'policies',
      selectionType,
      exportByFilterFunc: exportPoliciesByFilter,
      exportByIdsFunc: exportPoliciesByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load policies initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getPolicies({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getPolicies, called]);
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
    // start reloading if policies are available and no timer is running yet
    if (hasValue(policies) && !hasRunningTimer) {
      startReload();
    }
  }, [policies, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);
  return (
    <PoliciesComponent
      onCloned={refetch}
      onCloneError={showError}
      onCreated={refetch}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onImported={refetch}
      onInteraction={renewSessionTimeout}
      onSaved={refetch}
    >
      {({create, createAudit, edit, import: importFunc}) => (
        <React.Fragment>
          <PageTitle title={_('Policies')} />
          <EntitiesPage
            {...props}
            entities={policies}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filtersFilter={SCANCONFIGS_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            sectionIcon={<PolicyIcon size="large" />}
            selectionType={selectionType}
            sortBy={sortBy}
            sortDir={sortDir}
            table={Table}
            title={_('Policies')}
            toolBarIcons={ToolBarIcons}
            onCreateAuditClick={createAudit}
            onDeleteBulk={handleBulkDeletePolicies}
            onDownloadBulk={handleBulkExportPolicies}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSessionTimeout}
            onPolicyImportClick={importFunc}
            onPolicyCloneClick={handleClonePolicy}
            onPolicyCreateClick={create}
            onPolicyDeleteClick={handleDeletePolicy}
            onPolicyDownloadClick={handleDownloadPolicy}
            onPolicyEditClick={edit}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
          />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
          <Download ref={downloadRef} />
        </React.Fragment>
      )}
    </PoliciesComponent>
  );
};

export default withEntitiesContainer('policy', {
  entitiesSelector,
  loadEntities,
  defaultFilter: RESET_FILTER,
})(PoliciesPage);

// vim: set ts=2 sw=2 tw=80:
