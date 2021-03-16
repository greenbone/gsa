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

import {NOTES_FILTER_FILTER} from 'gmp/models/filter';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

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
  useLazyGetNotes,
  useExportNotesByFilter,
  useExportNotesByIds,
  useDeleteNotesByIds,
  useDeleteNotesByFilter,
  useCloneNote,
  useDeleteNote,
} from 'web/graphql/notes';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';
import useChangeFilter from 'web/utils/useChangeFilter';
import useFilterSortBy from 'web/utils/useFilterSortby';
import usePageFilter from 'web/utils/usePageFilter';
import usePrevious from 'web/utils/usePrevious';
import useSelection from 'web/utils/useSelection';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import FilterDialog from './filterdialog';
import NotesTable from './table';
import NoteComponent from './component';

import NotesDashboard, {NOTES_DASHBOARD_ID} from './dashboard';
import NoteIcon from 'web/components/icon/noteicon';

export const ToolBarIcons = ({onNoteCreateClick}) => {
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="managing-notes"
        title={_('Help: Notes')}
      />
      {capabilities.mayCreate('note') && (
        <NewIcon title={_('New Note')} onClick={onNoteCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onNoteCreateClick: PropTypes.func,
};

const Page = () => {
  const [downloadRef, handleDownload] = useDownload();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('note');
  const prevFilter = usePrevious(filter);
  const {
    change: changeFilter,
    remove: removeFilter,
    reset: resetFilter,
  } = useChangeFilter('note');
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

  // Note list state variables and methods
  const [
    getNotes,
    {counts, notes, error, loading: isLoading, refetch, called, pageInfo},
  ] = useLazyGetNotes();

  const exportEntity = useExportEntity();

  const [cloneNote] = useCloneNote();
  const [deleteNote] = useDeleteNote();
  const exportNote = useExportNotesByIds();

  const timeoutFunc = useEntitiesReloadInterval(notes);

  const exportNotesByFilter = useExportNotesByFilter();
  const exportNotesByIds = useExportNotesByIds();
  const bulkExportNotes = useBulkExportEntities();

  const [deleteNotesByIds] = useDeleteNotesByIds();
  const [deleteNotesByFilter] = useDeleteNotesByFilter();

  const bulkDeleteNotes = useBulkDeleteEntities();

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

  // Note methods
  const handleDownloadNote = exportedNote => {
    exportEntity({
      entity: exportedNote,
      exportFunc: exportNote,
      resourceType: 'notes',
      onDownload: handleDownload,
      showError,
    });
  };

  const handleCloneNote = useCallback(
    note => cloneNote(note.id).then(refetch, showError),
    [cloneNote, refetch, showError],
  );

  const handleDeleteNote = useCallback(
    note => deleteNote(note.id).then(refetch, showError),
    [deleteNote, refetch, showError],
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

  const handleBulkDeleteNotes = () => {
    return bulkDeleteNotes({
      selectionType,
      filter,
      selected,
      entities: notes,
      deleteByIdsFunc: deleteNotesByIds,
      deleteByFilterFunc: deleteNotesByFilter,
      onDeleted: refetch,
      onError: showError,
    });
  };

  const handleBulkExportNotes = () => {
    return bulkExportNotes({
      entities: notes,
      selected,
      filter,
      resourceType: 'notes',
      selectionType,
      exportByFilterFunc: exportNotesByFilter,
      exportByIdsFunc: exportNotesByIds,
      onDownload: handleDownload,
      onError: showError,
    });
  };

  useEffect(() => {
    if (!isLoadingFilter && hasValue(filter) && !called) {
      getNotes({
        filterString: filter.toFilterString(),
        first: filter.get('rows'),
      });
    }
  }, [isLoadingFilter, filter, getNotes, called]);

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
    // start reloading if notes are available and no timer is running yet
    if (hasValue(notes) && !hasRunningTimer) {
      startReload();
    }
  }, [notes, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => stopReload, [stopReload]);

  return (
    <NoteComponent
      onCreated={refetch}
      onCloned={refetch}
      onCloneError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onDeleted={refetch}
      onDeleteError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={refetch}
    >
      {({create, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Notes')} />
          <EntitiesPage
            dashboard={() => (
              <NotesDashboard
                filter={filter}
                onFilterChanged={changeFilter}
                onInteraction={renewSessionTimeout}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={NOTES_DASHBOARD_ID}
                onInteraction={renewSessionTimeout}
              />
            )}
            entities={notes}
            entitiesCounts={counts}
            entitiesError={error}
            entitiesSelected={selected}
            filter={filter}
            filterEditDialog={FilterDialog}
            filtersFilter={NOTES_FILTER_FILTER}
            isLoading={isLoading}
            isUpdating={isLoading}
            sectionIcon={<NoteIcon size="large" />}
            selectionType={selectionType}
            sortBy={sortBy}
            sortDir={sortDir}
            table={NotesTable}
            title={_('Notes')}
            toolBarIcons={ToolBarIcons}
            onChanged={refetch}
            onDeleteBulk={handleBulkDeleteNotes}
            onDownloadBulk={handleBulkExportNotes}
            onDownloaded={handleDownload}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSessionTimeout}
            onNoteCloneClick={handleCloneNote}
            onNoteCreateClick={create}
            onNoteDeleteClick={handleDeleteNote}
            onNoteDownloadClick={handleDownloadNote}
            onNoteEditClick={edit}
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
              entities={notes}
              selected={selected}
              filter={filter}
              selectionType={selectionType}
              entitiesCounts={counts}
              onClose={closeTagsDialog}
            />
          )}
        </React.Fragment>
      )}
    </NoteComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
