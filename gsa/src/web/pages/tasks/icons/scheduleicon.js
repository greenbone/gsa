/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes.js';

import Icon from '../../../components/icon/icon.js';

import DetailsLink from '../../../components/link/detailslink.js';

const ScheduleIcon = ({
  size,
  links = true,
  schedule,
}) => {
  if (schedule.userCapabilities.areDefined() &&
    schedule.userCapabilities.length === 0) {
    return (
      <Icon
        size={size}
        img="scheduled_inactive.svg"
        title={_('Schedule Unavailable. Name: {{name}}, ID: {{id}}',
          {name: schedule.name, id: schedule.id})}/>
    );
  }

  const {event = {}, name} = schedule;
  const {nextDate, recurrence = {}} = event;
  const {count} = recurrence;

  let title;
  if (!isDefined(nextDate)) {
    title = _('View Details of Schedule {{name}} (Next due: over)', {name});
  }
  else if (count === 1) {
    title = _('View Details of Schedule {{name}} (Next due: {{time}} Once)',
      {name, time: nextDate});
  }
  else if (count > 1) {
    title = _('View Details of Schedule {{name}} (Next due: ' +
      '{{time}}, {{periods}} more times )', {
        name,
        time: nextDate,
        periods: count,
      });
  }
  else {
    title = _('View Details of Schedule {{name}} (Next due: {{time}})',
      {name, time: nextDate});
  }

  return (
    <DetailsLink
      type="schedule"
      id={schedule.id}
      title={title}
      textOnly={!links}
    >
      <Icon
        size={size}
        img="scheduled.svg"
        alt={_('Schedule Details')}
      />
    </DetailsLink>
  );
};

ScheduleIcon.propTypes = {
  links: PropTypes.bool,
  schedule: PropTypes.model.isRequired,
  schedulePeriods: PropTypes.number,
  size: PropTypes.iconSize,
};

export default ScheduleIcon;

// vim: set ts=2 sw=2 tw=80:
