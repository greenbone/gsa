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
import React from 'react';

import _ from 'gmp/locale';

import {SCHEDULES_FILTER_FILTER} from 'gmp/models/filter';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScheduleIcon from 'web/components/icon/scheduleicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/schedules';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ScheduleComponent from './component';
import SchedulesTable, {SORT_FIELDS} from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onScheduleCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-schedules"
        title={_('Help: Schedules')}
      />
      {capabilities.mayCreate('schedule') && (
        <NewIcon title={_('New Schedule')} onClick={onScheduleCreateClick} />
      )}
    </IconDivider>
  ),
);

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
  onInteraction,
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
    onInteraction={onInteraction}
  >
    {({clone, create, delete: delete_func, download, edit, save}) => (
      <React.Fragment>
        <PageTitle title={_('Schedules')} />
        <EntitiesPage
          {...props}
          filterEditDialog={ScheduleFilterDialog}
          filtersFilter={SCHEDULES_FILTER_FILTER}
          sectionIcon={<ScheduleIcon size="large" />}
          table={SchedulesTable}
          title={_('Schedules')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
          onScheduleCloneClick={clone}
          onScheduleCreateClick={create}
          onScheduleDeleteClick={delete_func}
          onScheduleDownloadClick={download}
          onScheduleEditClick={edit}
          onScheduleSaveClick={save}
        />
      </React.Fragment>
    )}
  </ScheduleComponent>
);

SchedulesPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('schedule', {
  entitiesSelector,
  loadEntities,
})(SchedulesPage);

// vim: set ts=2 sw=2 tw=80:
