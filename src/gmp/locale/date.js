/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';

import {isDefined, isString, isJsDate} from 'gmp/utils/identity';

import {parseDate} from 'gmp/parser';

import {setLocale as setMomentLocale, isDate} from 'gmp/models/date';

const log = logger.getLogger('gmp.locale.date');

const SYSTEM_DEFAULT = 'system_default';
const LONG_DATE = 'longDate';
const SHORT_DATE = 'shortDate';
const TIME = 'time';

export const dateTimeFormatOptions = {
  [TIME]: {
    options: {
      12: {format: 'h:mm A', label: '12h'},
      24: {format: 'H:mm', label: '24h'},
      [SYSTEM_DEFAULT]: {
        format: 'LT',
        label: 'System Default',
      },
    },
  },
  [SHORT_DATE]: {
    options: {
      wmdy: {format: 'MM/DD/YYYY'},
      wdmy: {format: 'DD/MM/YYYY'},
      [SYSTEM_DEFAULT]: {format: 'L'},
    },
  },
  [LONG_DATE]: {
    options: {
      wmdy: {format: 'ddd, MMM D, YYYY', label: 'Weekday, Month, Day, Year'},
      wdmy: {format: 'ddd, D MMM YYYY', label: 'Weekday, Day, Month, Year'},
      [SYSTEM_DEFAULT]: {format: 'llll', label: 'System Default'},
    },
  },
};

export const setLocale = lang => {
  log.debug('Setting date locale to', lang);
  setMomentLocale(lang);
};

export const getLocale = () => setMomentLocale();

export const ensureDate = date => {
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

export const getFormattedDate = (date, format, tz) => {
  date = ensureDate(date);
  if (!isDefined(date)) {
    return undefined;
  }

  if (isDefined(tz)) {
    date.tz(tz);
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

export const getFormatString = (category, key) => {
  return dateTimeFormatOptions[category].options[key]?.format;
};

/**
 * Formats a date with a given time zone and user setting date format.
 *
 * @param {Date} date - The date to format.
 * @param {string} tz - The time zone.
 * @param {string} [userInterfaceDateFormat=SYSTEM_DEFAULT] - The user setting date format.
 * @returns {string} - The formatted date string.
 */
export const shortDate = (
  date,
  tz,
  userInterfaceDateFormat = SYSTEM_DEFAULT,
) => {
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
 * @returns {string} - The formatted date string.
 */

export const longDate = (
  date,
  tz,
  userInterfaceTimeFormat = SYSTEM_DEFAULT,
  userInterfaceDateFormat = SYSTEM_DEFAULT,
) => {
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
 * Formats a date with a given time zone and user setting formats.
 *
 * @param {Date} date - The date to format.
 * @param {string} tz - The time zone.
 * @param {string} [userInterfaceTimeFormat=SYSTEM_DEFAULT] - The user setting time format.
 * @param {string} [userInterfaceDateFormat=SYSTEM_DEFAULT] - The user setting date format.
 * @returns {string} - The formatted date string with time zone.
 */

export const dateTimeWithTimeZone = (
  date,
  tz,
  userInterfaceTimeFormat = SYSTEM_DEFAULT,
  userInterfaceDateFormat = SYSTEM_DEFAULT,
) => {
  const dateFormatString = getFormatString(LONG_DATE, userInterfaceDateFormat);
  const timeFormatString = getFormatString(TIME, userInterfaceTimeFormat);

  const useDefaultFormat =
    userInterfaceTimeFormat === SYSTEM_DEFAULT ||
    userInterfaceDateFormat === SYSTEM_DEFAULT ||
    (!isDefined(dateFormatString) && !isDefined(timeFormatString));

  const formatString = useDefaultFormat
    ? 'llll z'
    : `${dateFormatString} ${timeFormatString} z`;

  return getFormattedDate(date, formatString, tz);
};
