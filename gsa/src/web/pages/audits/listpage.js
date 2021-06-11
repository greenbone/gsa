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
import React, {useCallback, useEffect, useState} from 'react';

import _ from 'gmp/locale';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import {hasValue} from 'gmp/utils/identity';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import AuditIcon from 'web/components/icon/auditicon';
import NewIcon from 'web/components/icon/newicon';
import ManualIcon from 'web/components/icon/manualicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import {
  BulkTagComponent,
  useBulkDeleteEntities,
  useBulkExportEntities,
} from 'web/entities/bulkactions';
import EntitiesPage from 'web/entities/page';
import usePagination from 'web/entities/usePagination';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';

import {
  useCloneAudit,
  useDeleteAudit,
  useDeleteAuditsByFilter,
  useDeleteAuditsByIds,
  useExportAuditsByFilter,
  useExportAuditsByIds,
  useLazyGetAudits,
} from 'web/graphql/audits';

import PropTypes from 'web/utils/proptypes';

import useChangeFilter from 'web/utils/useChangeFilter';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useCapabilities from 'web/utils/useCapabilities';

import AuditComponent from './component';
import Table from './table';

export const ToolBarIcons = ({onAuditCreateClick}) => {
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        page="compliance-and-special-scans"
        anchor="configuring-and-managing-audits"
        title={_('Help: Audits')}
      />
      {capabilities.mayCreate('task') && (
        <NewIcon title={_('New Audit')} onClick={onAuditCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onAuditCreateClick: PropTypes.func.isRequired,
};

const Page = () => {
  // Page methods and hooks
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSession] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('audit');
  const prevFilter = usePrevious(filter);
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('audit');
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

  // Audit list state variables and methods
  const [
    getAudits,
    {counts, audits, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetAudits();

  const exportAuditsByFilter = useExportAuditsByFilter();
  const exportAuditsByIds = useExportAuditsByIds();
  const bulkExportAudits = useBulkExportEntities();

  const [deleteAudit] = useDeleteAudit();
  const [deleteAuditsByIds] = useDeleteAuditsByIds();
  const [deleteAuditsByFilter] = useDeleteAuditsByFilter();
  const bulkDeleteAudits = useBulkDeleteEntities();
  const [cloneAudit] = useCloneAudit();

  const timeoutFunc = useEntitiesReloadInterval(audits);
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

  // Audit methods
  const handleCloneAudit = useCallback(
    audit => cloneAudit(audit.id).then(refetch, showError),
    [cloneAudit, refetch, showError],
  );
  const handleDeleteAudit = useCallback(
    audit => deleteAudit(audit.id).then(refetch, showError),
    [deleteAudit, refetch, showError],
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

  const handleBulkDeleteAudits = () => {
    return bulkDeleteAudits({
      selectionType,
      filter,
      selected,
      entities: audits,
      deleteByIdsFunc: deleteAuditsByIds,
      deleteByFilterFunc: deleteAuditsByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportAudits = () => {
    return bulkExportAudits({
      entities: audits,
      selected,
      filter,
      resourceType: 'audits',
      selectionType,
      exportByFilterFunc: exportAuditsByFilter,
      exportByIdsFunc: exportAuditsByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  // Side effects
  useEffect(() => {
    // load audits initially after the filter is resolved
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getAudits({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getAudits, called]);

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
    // start reloading if audits are available and no timer is running yet
    if (hasValue(audits) && !hasRunningTimer) {
      startReload();
    }
  }, [audits, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  return (
    <AuditComponent
      onCloned={refetch}
      onCloneError={showError}
      onCreated={refetch}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSession}
      onResumed={refetch}
      onResumeError={showError}
      onSaved={refetch}
      onStarted={refetch}
      onStartError={showError}
      onStopped={refetch}
      onStopError={showError}
    >
      {({
        create,
        download,
        edit,
        start,
        stop,
        resume,
        reportDownload,
        gcrFormatDefined,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Audits')} />
          <EntitiesPage
            entities={audits}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filtersFilter={TASKS_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            gcrFormatDefined={gcrFormatDefined}
            selectionType={selectionType}
            sectionIcon={<AuditIcon size="large" />}
            sortBy={sortBy}
            sortDir={sortDir}
            table={Table}
            title={_('Audits')}
            toolBarIcons={ToolBarIcons}
            onDeleteBulk={handleBulkDeleteAudits}
            onDownloadBulk={handleBulkExportAudits}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSession}
            onReportDownloadClick={reportDownload}
            onAuditCloneClick={handleCloneAudit}
            onAuditCreateClick={create}
            onAuditDeleteClick={handleDeleteAudit}
            onAuditDownloadClick={download}
            onAuditEditClick={edit}
            onAuditResumeClick={resume}
            onAuditStartClick={start}
            onAuditStopClick={stop}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
            onTagsBulk={openTagsDialog}
          />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
          <Download ref={downloadRef} />
          {tagsDialogVisible && (
            <BulkTagComponent
              entities={audits}
              selected={selected}
              filter={filter}
              selectionType={selectionType}
              entitiesCounts={counts}
              onClose={closeTagsDialog}
            />
          )}
        </React.Fragment>
      )}
    </AuditComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
