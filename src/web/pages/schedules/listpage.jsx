/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {SCHEDULES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScheduleIcon from 'web/components/icon/scheduleicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/schedules';
import PropTypes from 'web/utils/proptypes';

import ScheduleComponent from './component';
import SchedulesFilterDialog from './filterdialog';
import SchedulesTable from './table';

export const ToolBarIcons = ({onScheduleCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-schedules"
        page="scanning"
        title={_('Help: Schedules')}
      />
      {capabilities.mayCreate('schedule') && (
        <NewIcon title={_('New Schedule')} onClick={onScheduleCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onScheduleCreateClick: PropTypes.func.isRequired,
};

const SchedulesPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <ScheduleComponent
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
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <React.Fragment>
          <PageTitle title={_('Schedules')} />
          <EntitiesPage
            {...props}
            filterEditDialog={SchedulesFilterDialog}
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
};

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
