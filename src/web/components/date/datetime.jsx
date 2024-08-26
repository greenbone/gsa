/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {dateTimeWithTimeZone, ensureDate} from 'gmp/locale/date';

import {isDefined, hasValue} from 'gmp/utils/identity';
import {useSelector} from 'react-redux';

import PropTypes from 'web/utils/proptypes';
import useUserTimezone from 'web/hooks/useUserTimezone';

const DateTime = ({formatter = dateTimeWithTimeZone, timezone, date}) => {
  const {timeFormat: userSettingTimeFormat, dateFormat: userSettingDateFormat} =
    useSelector(state => state.userSettings);

  date = ensureDate(date);

  const [userTimezone] = useUserTimezone();

  if (!hasValue(timezone)) {
    timezone = userTimezone;
  }

  return !isDefined(date) || !date.isValid()
    ? null
    : formatter(date, timezone, userSettingTimeFormat, userSettingDateFormat);
};

DateTime.propTypes = {
  date: PropTypes.date,
  formatter: PropTypes.func,
  timezone: PropTypes.string,
};

export default DateTime;
