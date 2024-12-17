/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import {capitalizeFirstLetter} from 'gmp/utils/string';
import React from 'react';
import StartIcon from 'web/components/icon/starticon';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const TaskStartIcon = ({
  capabilities,
  task,
  usageType = _('task'),
  onClick,
}) => {
  if (task.isRunning() || task.isContainer()) {
    return null;
  }

  if (
    !capabilities.mayOp('start_task') ||
    !task.userCapabilities.mayOp('start_task')
  ) {
    return (
      <StartIcon
        active={false}
        title={_('Permission to start {{usageType}} denied', {usageType})}
      />
    );
  }

  if (
    isDefined(task.schedule) &&
    task.schedule?.event?.event?.duration?.toSeconds() > 0
  ) {
    return (
      <StartIcon
        active={false}
        title={_(
          '{{usageType}} cannot be started manually' +
            ' because the assigned schedule has a duration limit',
          {
            usageType: capitalizeFirstLetter(usageType),
          },
        )}
      />
    );
  }

  if (!task.isActive()) {
    return <StartIcon title={_('Start')} value={task} onClick={onClick} />;
  }
  return (
    <StartIcon
      active={false}
      title={_('{{usageType}} is already active', {
        usageType: capitalizeFirstLetter(usageType),
      })}
    />
  );
};

TaskStartIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  task: PropTypes.model.isRequired,
  usageType: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(TaskStartIcon);

// vim: set ts=2 sw=2 tw=80:
