/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {SCHEDULES_FILTER_FILTER} from 'gmp/models/filter';
import {NewIcon, ScheduleIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';
import ScheduleFilterDialog from 'web/pages/schedules/ScheduleFilterDialog';
import SchedulesTable from 'web/pages/schedules/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/schedules';
import PropTypes from 'web/utils/PropTypes';
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
      onSaved={onChanged}
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
};

export default withEntitiesContainer('schedule', {
  entitiesSelector,
  loadEntities,
})(SchedulesPage);
