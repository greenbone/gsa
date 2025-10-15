/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Schedule from 'gmp/models/schedule';
import {isDefined} from 'gmp/utils/identity';
import {ScheduleIcon} from 'web/components/icon';
import {type ExtendedIconSize} from 'web/components/icon/DynamicIcon';
import DetailsLink from 'web/components/link/DetailsLink';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import {getTimezone} from 'web/store/usersettings/selectors';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/userSettingTimeDateFormatters';

interface TaskScheduleIconProps {
  links?: boolean;
  size?: ExtendedIconSize;
  schedule: Schedule;
}

const TaskScheduleIcon = ({
  size,
  links = true,
  schedule,
}: TaskScheduleIconProps) => {
  const [_] = useTranslation();
  const timezone = useShallowEqualSelector<unknown, string>(getTimezone);

  if (
    schedule.userCapabilities.areDefined() &&
    schedule.userCapabilities.length === 0
  ) {
    return (
      <ScheduleIcon
        active={false}
        size={size}
        title={_('Schedule Unavailable. Name: {{name}}, ID: {{id}}', {
          name: schedule.name as string,
          id: schedule.id as string,
        })}
      />
    );
  }

  const {event, name} = schedule;
  const {nextDate, recurrence} = event ?? {};
  const {count = 0} = recurrence ?? {};

  let title;
  if (!isDefined(nextDate)) {
    title = _('View Details of Schedule {{name}} (Next due: over)', {
      name: name as string,
    });
  } else if (count === 1) {
    title = _('View Details of Schedule {{name}} (Next due: {{time}} Once)', {
      name: name as string,
      time: formattedUserSettingDateTimeWithTimeZone(
        nextDate,
        timezone,
      ) as string,
    });
  } else if (count > 1) {
    title = _(
      'View Details of Schedule {{name}} (Next due: ' +
        '{{time}}, {{periods}} more times )',
      {
        name: name as string,
        time: formattedUserSettingDateTimeWithTimeZone(
          nextDate,
          timezone,
        ) as string,
        periods: count,
      },
    );
  } else {
    title = _('View Details of Schedule {{name}} (Next due: {{time}})', {
      name: name as string,
      time: formattedUserSettingDateTimeWithTimeZone(
        nextDate,
        timezone,
      ) as string,
    });
  }

  return (
    <DetailsLink
      id={schedule.id as string}
      textOnly={!links}
      title={title}
      type="schedule"
    >
      <ScheduleIcon size={size} title={_('Schedule Details')} />
    </DetailsLink>
  );
};

export default TaskScheduleIcon;
