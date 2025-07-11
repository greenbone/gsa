/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import TaskIconWithSync from 'web/pages/tasks/icons/TaskIconWithSync';
import TaskImportReportIcon from 'web/pages/tasks/icons/TaskImportReportIcon';
import TaskScheduleIcon from 'web/pages/tasks/icons/TaskScheduleIcon';
import TaskStopIcon from 'web/pages/tasks/icons/TaskStopIcon';
import PropTypes from 'web/utils/PropTypes';

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
}) => {
  const [_] = useTranslation();

  return (
    <IconDivider grow align={['center', 'center']}>
      {isDefined(entity.schedule) && (
        <TaskScheduleIcon links={links} schedule={entity.schedule} />
      )}
      <TaskIconWithSync task={entity} type="start" onClick={onTaskStartClick} />
      <TaskImportReportIcon task={entity} onClick={onReportImportClick} />
      <TaskStopIcon task={entity} onClick={onTaskStopClick} />
      <TaskIconWithSync
        task={entity}
        type="resume"
        onClick={onTaskResumeClick}
      />
      <TrashIcon entity={entity} name="task" onClick={onTaskDeleteClick} />
      <EditIcon entity={entity} name="task" onClick={onTaskEditClick} />
      <CloneIcon entity={entity} name="task" onClick={onTaskCloneClick} />
      <ExportIcon
        title={_('Export Task')}
        value={entity}
        onClick={onTaskDownloadClick}
      />
    </IconDivider>
  );
};

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
