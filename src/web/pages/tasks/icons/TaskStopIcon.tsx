/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Audit from 'gmp/models/audit';
import {type default as Task, USAGE_TYPE} from 'gmp/models/task';
import {StopIcon} from 'web/components/icon';
import {type ExtendedIconSize} from 'web/components/icon/DynamicIcon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface TaskStopIconProps<TTask extends Audit | Task> {
  size?: ExtendedIconSize;
  task: TTask;
  onClick?: (task: TTask) => void | Promise<void>;
}

const TaskStopIcon = <TTask extends Audit | Task>({
  size,
  task,
  onClick,
}: TaskStopIconProps<TTask>) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const type = task.usageType === USAGE_TYPE.audit ? _('audit') : _('task');

  if ((task.isRunning() || task.isQueued()) && !task.isContainer()) {
    if (
      !capabilities.mayOp('stop_task') ||
      !task.userCapabilities.mayOp('stop_task')
    ) {
      return (
        <StopIcon
          active={false}
          title={_('Permission to stop {{type}} denied', {type})}
        />
      );
    }
    return (
      <StopIcon
        size={size}
        title={_('Stop')}
        value={task}
        onClick={onClick as (task?: TTask) => void | Promise<void>}
      />
    );
  }
  return null;
};

export default TaskStopIcon;
