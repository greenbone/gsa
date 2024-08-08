/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {NOTES_FILTER_FILTER} from 'gmp/models/filter';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/notes';

import FilterDialog from './filterdialog';
import NotesTable from './table';
import NoteComponent from './component';

import NotesDashboard, {NOTES_DASHBOARD_ID} from './dashboard';
import NoteIcon from 'web/components/icon/noteicon';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onNoteCreateClick}) => (
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
  ),
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
}) => (
  <NoteComponent
    onCreated={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
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

// vim: set ts=2 sw=2 tw=80:
