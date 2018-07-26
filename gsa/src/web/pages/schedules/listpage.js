/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {SCHEDULES_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer2';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/schedules';

import ScheduleComponent from './component';
import SchedulesTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onScheduleCreateClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="scheduled-scan"
      title={_('Help: Schedules')}
    />
    {capabilities.mayCreate('schedule') &&
      <NewIcon
        title={_('New Schedule')}
        onClick={onScheduleCreateClick}
      />
    }
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onScheduleCreateClick: PropTypes.func.isRequired,
};

const ScheduleFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const SchedulesPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <ScheduleComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >{({
    clone,
    create,
    delete: delete_func,
    download,
    edit,
    save,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={ScheduleFilterDialog}
      sectionIcon="schedule.svg"
      table={SchedulesTable}
      title={_('Schedules')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onScheduleCloneClick={clone}
      onScheduleCreateClick={create}
      onScheduleDeleteClick={delete_func}
      onScheduleDownloadClick={download}
      onScheduleEditClick={edit}
      onScheduleSaveClick={save}
    />
  )}
  </ScheduleComponent>
);

SchedulesPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('schedule', {
  entitiesSelector,
  filtersFilter: SCHEDULES_FILTER_FILTER,
  loadEntities,
})(SchedulesPage);

// vim: set ts=2 sw=2 tw=80:
