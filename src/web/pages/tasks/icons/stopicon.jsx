/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import StopIcon from 'web/components/icon/stopicon';

const TaskStopIcon = ({
  capabilities,
  size,
  task,
  usageType = _('task'),
  onClick,
}) => {
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

// vim: set ts=2 sw=2 tw=80:
