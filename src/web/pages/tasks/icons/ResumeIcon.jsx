/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import {capitalizeFirstLetter} from 'gmp/utils/string';
import {ResumeIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TaskResumeIcon = ({task, usageType, onClick}) => {
  const [_] = useTranslation();
  usageType = usageType ?? _('task');
  const capabilities = useCapabilities();

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
  task: PropTypes.model.isRequired,
  usageType: PropTypes.string,
  onClick: PropTypes.func,
};

export default TaskResumeIcon;
