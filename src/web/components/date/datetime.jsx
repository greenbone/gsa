/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ensureDate} from 'gmp/locale/date';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/userSettingTimeDateFormatters';

import {isDefined, hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import useUserTimezone from 'web/hooks/useUserTimezone';

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
