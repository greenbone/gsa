/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ensureDate} from 'gmp/locale/date';
import {Date} from 'gmp/models/date';
import {isDefined, hasValue} from 'gmp/utils/identity';
import useUserTimezone from 'web/hooks/useUserTimezone';
import {
  formattedUserSettingDateTimeWithTimeZone,
  formattedUserSettingDateTimeObject,
} from 'web/utils/userSettingTimeDateFormatters';

interface DateTimeProps {
  date?: Date | string;
  formatter?: (date: Date, timezone: string) => string | undefined;
  timezone?: string;
  showTimezoneAsSeparateLine?: boolean;
}

const DateTime = ({
  formatter = formattedUserSettingDateTimeWithTimeZone,
  timezone,
  date,
  showTimezoneAsSeparateLine = false,
}: DateTimeProps) => {
  const [userTimezone] = useUserTimezone();

  date = ensureDate(date);
  if (!hasValue(timezone)) {
    timezone = userTimezone;
  }

  if (!isDefined(date) || !date.isValid()) {
    return null;
  }

  if (showTimezoneAsSeparateLine) {
    const formattedDate = formattedUserSettingDateTimeObject(date, timezone);

    if (!formattedDate) {
      return null;
    }

    return (
      <div>
        <p>{formattedDate.datetime}</p>
        <p>{formattedDate.timezone}</p>
      </div>
    );
  }

  return !isDefined(date) || !date.isValid() ? null : formatter(date, timezone);
};

export default DateTime;
