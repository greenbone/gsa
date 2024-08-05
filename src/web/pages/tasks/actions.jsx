/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';

import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import ImportReportIcon from 'web/pages/tasks/icons/importreporticon';
import ScheduleIcon from 'web/pages/tasks/icons/scheduleicon';
import StopIcon from 'web/pages/tasks/icons/stopicon';
import TaskIconWithSync from 'web/pages/tasks/icons/TaskIconsWithSync';

import PropTypes from 'web/utils/proptypes';

const Actions = ({
  entity,
  links,
  onReportImportClick,
  onTaskCloneClick,
  onTaskDeleteClick,
  onTaskDownloadClick,
  onTaskEditClick,
  onTaskResumeClick,
  onTaskStartClick,
  onTaskStopClick,
}) => (
  <IconDivider align={['center', 'center']} grow>
    {isDefined(entity.schedule) && (
      <ScheduleIcon schedule={entity.schedule} links={links} />
    )}
    <TaskIconWithSync type="start" task={entity} onClick={onTaskStartClick} />

    <ImportReportIcon task={entity} onClick={onReportImportClick} />

    <StopIcon task={entity} onClick={onTaskStopClick} />

    <TaskIconWithSync type="resume" task={entity} onClick={onTaskResumeClick} />

    <TrashIcon entity={entity} name="task" onClick={onTaskDeleteClick} />
    <EditIcon entity={entity} name="task" onClick={onTaskEditClick} />
    <CloneIcon entity={entity} name="task" onClick={onTaskCloneClick} />
    <ExportIcon
      value={entity}
      title={_('Export Task')}
      onClick={onTaskDownloadClick}
    />
  </IconDivider>
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onReportImportClick: PropTypes.func.isRequired,
  onTaskCloneClick: PropTypes.func.isRequired,
  onTaskDeleteClick: PropTypes.func.isRequired,
  onTaskDownloadClick: PropTypes.func.isRequired,
  onTaskEditClick: PropTypes.func.isRequired,
  onTaskResumeClick: PropTypes.func.isRequired,
  onTaskStartClick: PropTypes.func.isRequired,
  onTaskStopClick: PropTypes.func.isRequired,
};

export default withEntitiesActions(Actions);

// vim: set ts=2 sw=2 tw=80:
