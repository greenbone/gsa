/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import createDate, {
  Date as GmpDate,
  setLocaleDayjs,
  isDate,
} from 'gmp/models/date';
import {parseDate} from 'gmp/parser';
import {isDefined, isString, isJsDate} from 'gmp/utils/identity';

const log = logger.getLogger('gmp.locale.date');

export const SYSTEM_DEFAULT = 'system_default';
const LONG_DATE = 'longDate';
const SHORT_DATE = 'shortDate';
const TIME = 'time';

type DateTimeFormat = typeof LONG_DATE | typeof SHORT_DATE | typeof TIME;
type DateInput = undefined | Date | GmpDate | string;

export const dateTimeFormatOptions = {
  [TIME]: {
    options: {
      12: {format: 'h:mm A', label: '12h'},
      24: {format: 'H:mm', label: '24h'},
    },
  },
  [SHORT_DATE]: {
    options: {
      wmdy: {format: 'MM/DD/YYYY'},
      wdmy: {format: 'DD/MM/YYYY'},
    },
  },
  [LONG_DATE]: {
    options: {
      wmdy: {format: 'ddd, MMM D, YYYY', label: 'Weekday, Month, Day, Year'},
      wdmy: {format: 'ddd, D MMM YYYY', label: 'Weekday, Day, Month, Year'},
    },
  },
} as const;

export const setDateLocale = (lang: string): void => {
  log.debug('Setting date locale to', lang);
  setLocaleDayjs(lang);
};

export const getDateLocale = () => setLocaleDayjs();

export const ensureDate = (
  date: GmpDate | string | undefined | Date,
): undefined | GmpDate => {
  if (!isDefined(date)) {
    return undefined;
  }

  if (!isDate(date)) {
    if (isString(date) || isJsDate(date)) {
      return parseDate(date);
    }
    return undefined;
  }
  return date;
};

export const getFormattedDate = (
  date: DateInput,
  format: string,
  tz?: string,
): undefined | string => {
  date = ensureDate(date);
  if (!isDefined(date)) {
    return undefined;
  }

  if (isDefined(tz)) {
    date = createDate(date).tz(tz);
  } else {
    date = createDate(date);
  }

  return date.format(format);
};

/**
 * Retrieves the format string based on the category and key.
 *
 * @param {string} category - The category of the format.
 * @param {string} key - The key for the specific format.
 * @returns {string|undefined} - The format string if found, otherwise undefined.
 */
export const getFormatString = (
  category: DateTimeFormat,
  key: string,
): string | undefined => {
  return dateTimeFormatOptions[category].options[key]?.format;
};

/**
 * Formats a date with a given time zone and user setting date format.
 *
 * @param {Date} date - The date to format.
 * @param {string} tz - The time zone.
 * @param {string} [userInterfaceDateFormat=SYSTEM_DEFAULT] - The user setting date format.
 * @returns {string|undefined} - The formatted date string.
 */
export const shortDate = (
  date: DateInput,
  tz: string,
  userInterfaceDateFormat: string = SYSTEM_DEFAULT,
): string | undefined => {
  const dateFormatString = getFormatString(SHORT_DATE, userInterfaceDateFormat);

  const formatString =
    isDefined(dateFormatString) && userInterfaceDateFormat !== SYSTEM_DEFAULT
      ? dateFormatString
      : 'L';

  return getFormattedDate(date, formatString, tz);
};

/**
 * Formats a date with a given time zone and user setting formats.
 *
 * @param {Date} date - The date to format.
 * @param {string} tz - The time zone.
 * @param {string} [userInterfaceTimeFormat=SYSTEM_DEFAULT] - The user setting time format.
 * @param {string} [userInterfaceDateFormat=SYSTEM_DEFAULT] - The user setting date format.
 * @returns {string|undefined} - The formatted date string.
 */

export const longDate = (
  date: DateInput,
  tz: string,
  userInterfaceTimeFormat: string = SYSTEM_DEFAULT,
  userInterfaceDateFormat: string = SYSTEM_DEFAULT,
): string | undefined => {
  const dateFormatString = getFormatString(LONG_DATE, userInterfaceDateFormat);
  const timeFormatString = getFormatString(TIME, userInterfaceTimeFormat);

  const useDefaultFormat =
    userInterfaceTimeFormat === SYSTEM_DEFAULT ||
    userInterfaceDateFormat === SYSTEM_DEFAULT ||
    (!isDefined(dateFormatString) && !isDefined(timeFormatString));

  const formatString = useDefaultFormat
    ? 'llll'
    : `${dateFormatString} ${timeFormatString}`;

  return getFormattedDate(date, formatString, tz);
};

/**
 * Formats a date with a given time zone and user setting formats, including the full timezone name.
 *
 * @param {Date} date - The date to format.
 * @param {string} [tz] - The time zone identifier (e.g., 'CET', 'UTC'). Optional if date already has timezone.
 * @param {string} [userInterfaceTimeFormat=SYSTEM_DEFAULT] - The user setting time format ('12' or '24').
 * @param {string} [userInterfaceDateFormat=SYSTEM_DEFAULT] - The user setting date format ('wmdy' or 'wdmy').
 * @returns {string|undefined} - The formatted date string with the full timezone name.
 */
export const dateTimeWithTimeZone = (
  date: DateInput,
  tz: string,
  userInterfaceTimeFormat: string = SYSTEM_DEFAULT,
  userInterfaceDateFormat: string = SYSTEM_DEFAULT,
): string | undefined => {
  const dateObj = ensureDate(date);
  if (!isDefined(dateObj)) {
    return undefined;
  }

  const dateFormatString = getFormatString(LONG_DATE, userInterfaceDateFormat);
  const timeFormatString = getFormatString(TIME, userInterfaceTimeFormat);

  const useDefaultFormat =
    userInterfaceTimeFormat === SYSTEM_DEFAULT ||
    userInterfaceDateFormat === SYSTEM_DEFAULT ||
    (!isDefined(dateFormatString) && !isDefined(timeFormatString));

  const formatString = useDefaultFormat
    ? 'llll'
    : `${dateFormatString} ${timeFormatString}`;

  const formattedDate = getFormattedDate(dateObj, formatString, tz);
  if (!isDefined(formattedDate)) {
    return undefined;
  }

  let tzDisplay = '';
  if (tz) {
    // If a timezone is provided, use it
    tzDisplay = dateObj.tz(tz).format('zzz');
    // @ts-expect-error
  } else if (dateObj.$x?.$timezone) {
    // Otherwise use the timezone from the date object if available
    tzDisplay = dateObj.format('zzz');
  }

  return tzDisplay ? `${formattedDate} ${tzDisplay}` : formattedDate;
};
