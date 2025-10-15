/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Audit} from 'gmp/models/audit';
import {type default as Task, USAGE_TYPE} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import {capitalizeFirstLetter} from 'gmp/utils/string';
import {ResumeIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface TaskResumeIconProps<TTask extends Audit | Task> {
  task: TTask;
  onClick?: (task: TTask) => void | Promise<void>;
}

const TaskResumeIcon = <TTask extends Audit | Task>({
  task,
  onClick,
}: TaskResumeIconProps<TTask>) => {
  const [_] = useTranslation();
  const type = task.usageType === USAGE_TYPE.audit ? _('audit') : _('task');
  const capabilities = useCapabilities();

  if (task.isQueued()) {
    return null;
  }

  if (task.isContainer()) {
    return (
      <ResumeIcon
        active={false}
        title={_('{{type}} is a container', {
          type: capitalizeFirstLetter(type),
        })}
      />
    );
  }

  if (isDefined(task.schedule)) {
    return (
      <ResumeIcon
        active={false}
        title={_('{{type}} is scheduled', {
          type: capitalizeFirstLetter(type),
        })}
      />
    );
  }

  if (task.isStopped() || task.isInterrupted()) {
    if (
      capabilities.mayOp('start_task') &&
      task.userCapabilities.mayOp('start_task')
    ) {
      return (
        <ResumeIcon
          title={_('Resume')}
          value={task}
          onClick={onClick as (task?: TTask) => void | Promise<void>}
        />
      );
    }
    return (
      <ResumeIcon
        active={false}
        title={_('Permission to resume {{type}} denied', {type})}
      />
    );
  }

  return (
    <ResumeIcon
      active={false}
      title={_('{{type}} is not stopped', {
        type: capitalizeFirstLetter(type),
      })}
    />
  );
};

export default TaskResumeIcon;
