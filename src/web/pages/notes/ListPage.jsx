/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {NewIcon, NoteIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import NoteComponent from 'web/pages/notes/Component';
import NotesDashboard, {NOTES_DASHBOARD_ID} from 'web/pages/notes/dashboard';
import FilterDialog from 'web/pages/notes/FilterDialog';
import NotesTable from 'web/pages/notes/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/notes';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
export const ToolBarIcons = withCapabilities(
  ({capabilities, onNoteCreateClick}) => {
    const [_] = useTranslation();

    return (
      <IconDivider>
        <ManualIcon
          anchor="managing-notes"
          page="reports"
          title={_('Help: Notes')}
        />
        {capabilities.mayCreate('note') && (
          <NewIcon title={_('New Note')} onClick={onNoteCreateClick} />
        )}
      </IconDivider>
    );
  },
);

ToolBarIcons.propTypes = {
  onNoteCreateClick: PropTypes.func,
};

const Page = ({
  filter,
  onChanged,
  onDownloaded,
  onError,
  onFilterChanged,
  onInteraction,
  ...props
}) => {
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
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Notes')} />
          <EntitiesPage
            {...props}
            dashboard={() => (
              <NotesDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
                onInteraction={onInteraction}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={NOTES_DASHBOARD_ID}
                onInteraction={onInteraction}
              />
            )}
            filter={filter}
            filterEditDialog={FilterDialog}
            filtersFilter={NOTES_FILTER_FILTER}
            sectionIcon={<NoteIcon size="large" />}
            table={NotesTable}
            title={_('Notes')}
            toolBarIcons={ToolBarIcons}
            onError={onError}
            onFilterChanged={onFilterChanged}
            onInteraction={onInteraction}
            onNoteCloneClick={clone}
            onNoteCreateClick={create}
            onNoteDeleteClick={delete_func}
            onNoteDownloadClick={download}
            onNoteEditClick={edit}
          />
        </React.Fragment>
      )}
    </NoteComponent>
  );
};

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('note', {
  entitiesSelector,
  loadEntities,
})(Page);
