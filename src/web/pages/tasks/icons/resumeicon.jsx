/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import {capitalizeFirstLetter} from 'gmp/utils/string';
import withCapabilities from 'web/utils/withCapabilities';

import ResumeIcon from 'web/components/icon/resumeicon';

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
