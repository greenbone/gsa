/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import StopIcon from 'web/components/icon/stopicon';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

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
