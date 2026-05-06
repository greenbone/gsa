/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  longDate,
  shortDate,
  dateTimeWithTimeZone,
  dateTimeWithTimeZoneObject,
  type DateInput,
  type DateTimeKey,
} from 'gmp/locale/date';

export const formattedUserSettingShortDate = (date: DateInput, tz?: string) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );

  return shortDate(date, tz, userInterfaceDateFormat as DateTimeKey);
};

export const formattedUserSettingLongDate = (date: DateInput, tz?: string) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );

  const userInterfaceTimeFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );
  return longDate(
    date,
    tz,
    userInterfaceTimeFormat as DateTimeKey,
    userInterfaceDateFormat as DateTimeKey,
  );
};

export const formattedUserSettingDateTimeWithTimeZone = (
  date: DateInput,
  tz?: string,
) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );
  const userInterfaceTimeFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );
  return dateTimeWithTimeZone(
    date,
    tz,
    userInterfaceTimeFormat as DateTimeKey,
    userInterfaceDateFormat as DateTimeKey,
  );
};

/**
 * Returns date and timezone as separate object properties
 * for display on separate lines
 *
 * @param date - The date to format
 * @param tz - The timezone
 * @returns Object with datetime and timezone properties or undefined
 */

export const formattedUserSettingDateTimeObject = (
  date: DateInput,
  tz?: string,
) => {
  const userInterfaceDateFormat = localStorage.getItem(
    'userInterfaceDateFormat',
  );
  const userInterfaceTimeFormat = localStorage.getItem(
    'userInterfaceTimeFormat',
  );

  return dateTimeWithTimeZoneObject(
    date,
    tz,
    userInterfaceTimeFormat as DateTimeKey,
    userInterfaceDateFormat as DateTimeKey,
  );
};
