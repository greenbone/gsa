/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Task from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import TaskIconWithSync from 'web/pages/tasks/icons/TaskIconWithSync';
import TaskImportReportIcon from 'web/pages/tasks/icons/TaskImportReportIcon';
import TaskScheduleIcon from 'web/pages/tasks/icons/TaskScheduleIcon';
import TaskStopIcon from 'web/pages/tasks/icons/TaskStopIcon';

export interface TaskActionsProps
  extends Omit<EntitiesActionsProps<Task>, 'children'> {
  links?: boolean;
  onReportImportClick?: (task: Task) => void | Promise<void>;
  onTaskCloneClick?: (task: Task) => void | Promise<void>;
  onTaskDeleteClick?: (task: Task) => void | Promise<void>;
  onTaskEditClick?: (task: Task) => void | Promise<void>;
  onTaskResumeClick?: (task: Task) => void | Promise<void>;
  onTaskStartClick?: (task: Task) => void | Promise<void>;
  onTaskStopClick?: (task: Task) => void | Promise<void>;
  onTaskDownloadClick?: (task: Task) => void | Promise<void>;
}

const TaskActions = ({
  'data-testid': dataTestId,
  entity,
  links,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onReportImportClick,
  onTaskCloneClick,
  onTaskDeleteClick,
  onTaskDownloadClick,
  onTaskEditClick,
  onTaskResumeClick,
  onTaskStartClick,
  onTaskStopClick,
}: TaskActionsProps) => {
  const [_] = useTranslation();
  return (
    <EntitiesActions<Task>
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        {isDefined(entity.schedule) && (
          <TaskScheduleIcon links={links} schedule={entity.schedule} />
        )}
        <TaskIconWithSync
          task={entity}
          type="start"
          onClick={onTaskStartClick}
        />
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
          onClick={onTaskDownloadClick as (task?: Task) => void}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default TaskActions;
