/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Task from 'gmp/models/task';
import {ImportIcon} from 'web/components/icon';
import {type ExtendedIconSize} from 'web/components/icon/DynamicIcon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface TaskImportReportIconProps {
  size?: ExtendedIconSize;
  task: Task;
  onClick?: (task: Task) => void | Promise<void>;
}

const TaskImportReportIcon = ({
  size,
  task,
  onClick,
}: TaskImportReportIconProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  if (!task.isContainer() || !capabilities.mayCreate('report')) {
    return null;
  }

  return (
    <ImportIcon
      size={size}
      title={_('Import Report')}
      value={task}
      onClick={onClick as (task?: Task) => void | Promise<void>}
    />
  );
};

export default TaskImportReportIcon;
