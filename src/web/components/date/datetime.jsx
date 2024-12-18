/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ensureDate} from 'gmp/locale/date';
import {isDefined, hasValue} from 'gmp/utils/identity';
import useUserTimezone from 'web/hooks/useUserTimezone';
import PropTypes from 'web/utils/proptypes';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/userSettingTimeDateFormatters';

const DateTime = ({
  formatter = formattedUserSettingDateTimeWithTimeZone,
  timezone,
  date,
}) => {
  date = ensureDate(date);

  const [userTimezone] = useUserTimezone();

  if (!hasValue(timezone)) {
    timezone = userTimezone;
  }

  return !isDefined(date) || !date.isValid() ? null : formatter(date, timezone);
};

DateTime.propTypes = {
  date: PropTypes.date,
  formatter: PropTypes.func,
  timezone: PropTypes.string,
};

export default DateTime;
