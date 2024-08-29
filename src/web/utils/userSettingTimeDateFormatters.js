/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {longDate, shortDate, dateTimeWithTimeZone} from 'gmp/locale/date';

export const formattedUserSettingShortDate = (date, tz) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );

  return shortDate(date, tz, userInterfaceDateFormat);
};

export const formattedUserSettingLongDate = (date, tz) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );

  const userInterfaceTimeFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );
  return longDate(date, tz, userInterfaceTimeFormat, userInterfaceDateFormat);
};

export const formattedUserSettingDateTimeWithTimeZone = (date, tz) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );
  const userInterfaceTimeFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );
  return dateTimeWithTimeZone(
    date,
    tz,
    userInterfaceTimeFormat,
    userInterfaceDateFormat,
  );
};
