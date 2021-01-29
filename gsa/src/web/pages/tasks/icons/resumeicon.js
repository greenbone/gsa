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

import {isDefined} from 'gmp/utils/identity';
import {capitalizeFirstLetter} from 'gmp/utils/string';

import ResumeIcon from 'web/components/icon/resumeicon';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const TaskResumeIcon = ({
  capabilities,
  task,
  usageType = _('task'),
  onClick,
}) => {
  if (task.isQueued()) {
    return null;
  }

  if (task.isContainer()) {
    return (
      <ResumeIcon
        active={false}
        alt={_('Resume')}
        title={_('{{usageType}} is a container', {
          usageType: capitalizeFirstLetter(usageType),
        })}
      />
    );
  }

  if (isDefined(task.schedule)) {
    return (
      <ResumeIcon
        active={false}
        alt={_('Resume')}
        title={_('{{usageType}} is scheduled', {
          usageType: capitalizeFirstLetter(usageType),
        })}
      />
    );
  }

  if (task.isStopped() || task.isInterrupted()) {
    if (
      capabilities.mayOp('start_task') &&
      task.userCapabilities.mayOp('start_task')
    ) {
      return <ResumeIcon title={_('Resume')} value={task} onClick={onClick} />;
    }
    return (
      <ResumeIcon
        active={false}
        alt={_('Resume')}
        title={_('Permission to resume {{usageType}} denied', {usageType})}
      />
    );
  }

  return (
    <ResumeIcon
      active={false}
      alt={_('Resume')}
      title={_('{{usageType}} is not stopped', {
        usageType: capitalizeFirstLetter(usageType),
      })}
    />
  );
};

TaskResumeIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  task: PropTypes.model.isRequired,
  usageType: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(TaskResumeIcon);

// vim: set ts=2 sw=2 tw=80:
