/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {NOTES_FILTER_FILTER} from 'gmp/models/filter';

import IconDivider from 'web/components/layout/icondivider';

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

const ToolBarIcons = withCapabilities(({capabilities, onNoteCreateClick}) => (
  <IconDivider>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="notes"
      title={_('Help: Notes')}
    />
    {capabilities.mayCreate('note') && (
      <NewIcon title={_('New Note')} onClick={onNoteCreateClick} />
    )}
  </IconDivider>
));

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
