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

import {connect} from 'react-redux';

import _ from 'gmp/locale';
import {dateTimeWithTimeZone} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import ScheduleIcon from 'web/components/icon/scheduleicon';

import DetailsLink from 'web/components/link/detailslink';

import {getTimezone} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';

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
