/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import ScheduleIcon from 'web/components/icon/scheduleicon';

import DetailsLink from 'web/components/link/detailslink';

import {dateTimeWithTimeZone} from 'gmp/locale/date';
import {getTimezone} from 'web/store/usersettings/selectors';

const TaskScheduleIcon = ({size, links = true, schedule, timezone}) => {
  if (
    schedule.userCapabilities.areDefined() &&
    schedule.userCapabilities.length === 0
  ) {
    return (
      <ScheduleIcon
        active={false}
        size={size}
        title={_('Schedule Unavailable. Name: {{name}}, ID: {{id}}', {
          name: schedule.name,
          id: schedule.id,
        })}
      />
    );
  }

  const {event = {}, name} = schedule;
  const {nextDate, recurrence = {}} = event;
  const {count} = recurrence;

  let title;
  if (!isDefined(nextDate)) {
    title = _('View Details of Schedule {{name}} (Next due: over)', {name});
  } else if (count === 1) {
    title = _('View Details of Schedule {{name}} (Next due: {{time}} Once)', {
      name,
      time: dateTimeWithTimeZone(nextDate, timezone),
    });
  } else if (count > 1) {
    title = _(
      'View Details of Schedule {{name}} (Next due: ' +
        '{{time}}, {{periods}} more times )',
      {
        name,
        time: dateTimeWithTimeZone(nextDate, timezone),
        periods: count,
      },
    );
  } else {
    title = _('View Details of Schedule {{name}} (Next due: {{time}})', {
      name,
      time: dateTimeWithTimeZone(nextDate, timezone),
    });
  }

  return (
    <DetailsLink
      type="schedule"
      id={schedule.id}
      title={title}
      textOnly={!links}
    >
      <ScheduleIcon size={size} alt={_('Schedule Details')} />
    </DetailsLink>
  );
};

TaskScheduleIcon.propTypes = {
  links: PropTypes.bool,
  schedule: PropTypes.model.isRequired,
  schedulePeriods: PropTypes.number,
  size: PropTypes.iconSize,
  timezone: PropTypes.string,
};

const mapStateToProps = rootState => ({
  timezone: getTimezone(rootState),
});

export default connect(mapStateToProps)(TaskScheduleIcon);

// vim: set ts=2 sw=2 tw=80:
