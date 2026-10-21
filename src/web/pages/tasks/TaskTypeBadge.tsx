/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Task from 'gmp/models/task';
import {
  ContainerIcon,
  GlobeIcon,
  HatAndGlassesIcon,
  ImportIcon,
  RadarIcon,
} from 'web/components/icon';
import TaskTypePill from 'web/components/status/TaskTypePill';
import useTranslation from 'web/hooks/useTranslation';

interface TaskTypeBadgeProps {
  task: Task;
}

const TaskTypeBadge = ({task}: TaskTypeBadgeProps) => {
  const [_] = useTranslation();
  let icon = <RadarIcon size="small" title={_('Task')} />;
  let label = _('Scan Task');

  if (task.isContainerImage()) {
    icon = <ContainerIcon size="small" title={_('Container Image Task')} />;
    label = _('Container Image Task');
  } else if (task.isWebApplication()) {
    icon = <GlobeIcon size="small" title={_('Web Application Task')} />;
    label = _('Web Application Task');
  } else if (task.isAgent()) {
    icon = <HatAndGlassesIcon size="small" title={_('Agent Task')} />;
    label = _('Agent Task');
  } else if (task.isImport()) {
    icon = <ImportIcon size="small" title={_('Import Task')} />;
    label = _('Import Task');
  }

  return (
    <TaskTypePill>
      {icon}
      {label}
    </TaskTypePill>
  );
};

export default TaskTypeBadge;
