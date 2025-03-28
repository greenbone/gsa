/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ensureDate} from 'gmp/locale/date';
import {Date} from 'gmp/models/date';
import {isDefined, hasValue} from 'gmp/utils/identity';
import useUserTimezone from 'web/hooks/useUserTimezone';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/userSettingTimeDateFormatters';

interface DateTimeProps {
  date?: Date | string;
  formatter?: (date: Date, timezone: string) => string | undefined;
  timezone?: string;
}

const DateTime: React.FC<DateTimeProps> = ({
  formatter = formattedUserSettingDateTimeWithTimeZone,
  timezone,
  date,
}: DateTimeProps) => {
  const [userTimezone] = useUserTimezone();

  date = ensureDate(date);
  if (!hasValue(timezone)) {
    timezone = userTimezone;
  }

  return !isDefined(date) || !date.isValid() ? null : formatter(date, timezone);
};

export default DateTime;
