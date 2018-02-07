/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../../utils/proptypes.js';

import Icon from '../../../components/icon/icon.js';

import DetailsLink from '../../../components/link/detailslink.js';

const ScheduleIcon = ({
  size,
  links = true,
  task,
}) => {
  const {schedule} = task;

  if (!is_defined(schedule)) {
    return null;
  }

  if (schedule.user_capabilities.areDefined() &&
    schedule.user_capabilities.length === 0) {
    return (
      <Icon
        size={size}
        img="scheduled_inactive.svg"
        title={_('Schedule Unavailable. Name: {{name}}, ID: {{id}}',
          {name: schedule.name, id: schedule.id})}/>
    );
  }
  let title;
  if (schedule.next_time === 'over') {
    title = _('View Details of Schedule {{name}} (Next due: over)',
      {name: schedule.name});
  }
  else if (task.schedule_periods === 1) {
    title = _('View Details of Schedule {{name}} (Next due: {{time}} Once)',
      {name: schedule.name, time: schedule.next_time});
  }
  else if (task.schedule_periods > 1) {
    title = _('View Details of Schedule {{name}} (Next due: ' +
      '{{next_time}}, {{periods}} more times )', {
        name: schedule.name,
        time: schedule.next_time,
        periods: task.schedule_periods,
      });
  }
  else {
    title = _('View Details of Schedule {{name}} (Next due: {{time}})',
      {name: schedule.name, time: schedule.next_time});
  }

  return (
    <DetailsLink
      type="schedule"
      id={schedule.id}
      title={title}
      textOnly={!links}>
      <Icon
        size={size}
        img="scheduled.svg"
        alt={_('Schedule Details')}/>
    </DetailsLink>
  );
};

ScheduleIcon.propTypes = {
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ScheduleIcon;

// vim: set ts=2 sw=2 tw=80:
