/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {connect} from 'react-redux';
import {isDefined} from 'gmp/utils/identity';
import {ScheduleIcon} from 'web/components/icon';
import DetailsLink from 'web/components/link/DetailsLink';
import useTranslation from 'web/hooks/useTranslation';
import {getTimezone} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/userSettingTimeDateFormatters';
const TaskScheduleIcon = ({size, links = true, schedule, timezone}) => {
  const [_] = useTranslation();
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
      time: formattedUserSettingDateTimeWithTimeZone(nextDate, timezone),
    });
  } else if (count > 1) {
    title = _(
      'View Details of Schedule {{name}} (Next due: ' +
        '{{time}}, {{periods}} more times )',
      {
        name,
        time: formattedUserSettingDateTimeWithTimeZone(nextDate, timezone),
        periods: count,
      },
    );
  } else {
    title = _('View Details of Schedule {{name}} (Next due: {{time}})', {
      name,
      time: formattedUserSettingDateTimeWithTimeZone(nextDate, timezone),
    });
  }

  return (
    <DetailsLink
      id={schedule.id}
      textOnly={!links}
      title={title}
      type="schedule"
    >
      <ScheduleIcon alt={_('Schedule Details')} size={size} />
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
