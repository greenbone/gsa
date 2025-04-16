/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {StopIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
const TaskStopIcon = ({
  capabilities,
  size,
  task,
  usageType = 'task',
  onClick,
}) => {
  const [_] = useTranslation();
  usageType = _(usageType);
  if ((task.isRunning() || task.isQueued()) && !task.isContainer()) {
    if (
      !capabilities.mayOp('stop_task') ||
      !task.userCapabilities.mayOp('stop_task')
    ) {
      return (
        <StopIcon
          active={false}
          title={_('Permission to stop {{usageType}} denied', {usageType})}
        />
      );
    }
    return (
      <StopIcon size={size} title={_('Stop')} value={task} onClick={onClick} />
    );
  }
  return null;
};

TaskStopIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  usageType: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(TaskStopIcon);
