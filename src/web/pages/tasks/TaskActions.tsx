/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type Task from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import {StartIcon, StopIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import {useMultiTargetTasks} from 'web/credential-aware/MultiTargetTaskContext';
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

export interface TaskActionsProps extends Omit<
  EntitiesActionsProps<Task>,
  'children'
> {
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
  const {byTaskId, start, stop} = useMultiTargetTasks();
  const [groupError, setGroupError] = useState('');
  const group = byTaskId[entity.id];
  const isMultiTarget =
    Boolean(group) ||
    entity.comment?.startsWith('Multi-target review task; group ');

  if (isMultiTarget) {
    const active = group?.children.some(child =>
      ['Running', 'Requested', 'Queued'].includes(child.status),
    );
    const operate = async () => {
      if (!group) {
        return;
      }
      setGroupError('');
      try {
        if (active) {
          await stop(group);
        } else {
          await start(group);
        }
      } catch (reason) {
        setGroupError((reason as Error).message);
      }
    };
    return (
      <EntitiesActions<Task>
        data-testid={dataTestId}
        entity={entity}
        selectionType={selectionType}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
      >
        <IconDivider grow align={['center', 'center']}>
          {!group ? (
            <span title={_('Loading multi-target task controls')}>…</span>
          ) : active ? (
            <StopIcon
              title={_('Stop all hosts')}
              onClick={() => void operate()}
            />
          ) : (
            <StartIcon
              title={
                group.report_count
                  ? _('Run all hosts again')
                  : _('Start all hosts')
              }
              onClick={() => void operate()}
            />
          )}
          {groupError && (
            <span role="alert" title={groupError}>
              !
            </span>
          )}
        </IconDivider>
      </EntitiesActions>
    );
  }
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
