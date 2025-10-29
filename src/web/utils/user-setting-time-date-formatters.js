/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  longDate,
  shortDate,
  dateTimeWithTimeZone,
  dateTimeWithTimeZoneObject,
} from 'gmp/locale/date';

export const formattedUserSettingShortDate = (date, tz) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
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

/**
 * Returns date and timezone as separate object properties
 * for display on separate lines
 *
 * @param {DateInput} date - The date to format
 * @param {string} tz - The timezone
 * @returns {Object|undefined} - Object with datetime and timezone properties or undefined
 */

export const formattedUserSettingDateTimeObject = (date, tz) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );
  const userInterfaceTimeFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );

  return dateTimeWithTimeZoneObject(
    date,
    tz,
    userInterfaceTimeFormat,
    userInterfaceDateFormat,
  );
};
