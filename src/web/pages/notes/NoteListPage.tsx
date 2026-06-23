/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import type Note from 'gmp/models/note';
import DashboardControls from 'web/components/dashboard/Controls';
import {NoteIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import NotesDashboard, {NOTES_DASHBOARD_ID} from 'web/pages/notes/dashboard';
import NoteComponent from 'web/pages/notes/NoteComponent';
import FilterDialog from 'web/pages/notes/NoteFilterDialog';
import NoteListPageToolBarIcons from 'web/pages/notes/NoteListPageToolBarIcons';
import NotesTable from 'web/pages/notes/NoteTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/notes';

const NoteListPage = ({
  entities,
  entitiesCounts,
  entitiesError,
  filter,
  isLoading,
  selectionType,
  sortBy,
  sortDir,
  onChanged,
  onDeleteBulk,
  onDownloadBulk,
  onDownloaded,
  onEntityDeselected,
  onEntitySelected,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
  onSelectionTypeChange,
  onSortChange,
  onTagsBulk,
}: WithEntitiesContainerComponentProps<Note>) => {
  const [_] = useTranslation();
  return (
    <NoteComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <>
          <PageTitle title={_('Notes')} />
          <EntitiesPage
            createFilterType="note"
            dashboard={() => (
              <NotesDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
              />
            )}
            dashboardControls={() => (
              <DashboardControls dashboardId={NOTES_DASHBOARD_ID} />
            )}
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            filter={filter}
            filterEditDialog={FilterDialog}
            filtersFilter={NOTES_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<NoteIcon size="large" />}
            table={
              <NotesTable
                entities={entities}
                entitiesCounts={entitiesCounts}
                filter={filter}
                selectionType={selectionType}
                sortBy={sortBy}
                sortDir={sortDir}
                onDeleteBulk={onDeleteBulk}
                onDownloadBulk={onDownloadBulk}
                onEntityDeselected={onEntityDeselected}
                onEntitySelected={onEntitySelected}
                onFirstClick={onFirstClick}
                onLastClick={onLastClick}
                onNextClick={onNextClick}
                onNoteCloneClick={clone}
                onNoteDeleteClick={deleteFunc}
                onNoteDownloadClick={download}
                onNoteEditClick={edit}
                onPreviousClick={onPreviousClick}
                onSelectionTypeChange={onSelectionTypeChange}
                onSortChange={onSortChange}
                onTagsBulk={onTagsBulk}
              />
            }
            title={_('Notes')}
            toolBarIcons={
              <NoteListPageToolBarIcons onNoteCreateClick={create} />
            }
            onError={onError}
            onFilterChanged={onFilterChanged}
            onFilterCreated={onFilterCreated}
            onFilterRemoved={onFilterRemoved}
            onFilterReset={onFilterReset}
          />
        </>
      )}
    </NoteComponent>
  );
};

export default withEntitiesContainer<Note>('note', {
  entitiesSelector,
  loadEntities,
})(NoteListPage);
