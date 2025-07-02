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

export const DATE_TIME_FORMAT_OPTIONS = {
  WMDY: 'wmdy',
  WDMY: 'wdmy',
  TIME_12: '12',
  TIME_24: '24',
} as const;

export const DATE_TIME_CATEGORY = {
  TIME: 'time',
  SHORT_DATE: 'shortDate',
  LONG_DATE: 'longDate',
} as const;

export const SYSTEM_DEFAULT = 'system_default';

export type DateTimeCategory =
  (typeof DATE_TIME_CATEGORY)[keyof typeof DATE_TIME_CATEGORY];

export type DateTimeFormatOptions =
  (typeof DATE_TIME_FORMAT_OPTIONS)[keyof typeof DATE_TIME_FORMAT_OPTIONS];

type DateInput = undefined | Date | GmpDate | string;

export type DateTimeKey = DateTimeFormatOptions | typeof SYSTEM_DEFAULT;

export const dateTimeFormatOptions: {
  [category in DateTimeCategory]: {
    options: Partial<
      Record<DateTimeFormatOptions, {format: string; label?: string}>
    >;
  };
} = {
  [DATE_TIME_CATEGORY.TIME]: {
    options: {
      [DATE_TIME_FORMAT_OPTIONS.TIME_12]: {format: 'h:mm A', label: '12h'},
      [DATE_TIME_FORMAT_OPTIONS.TIME_24]: {format: 'H:mm', label: '24h'},
    },
  },
  [DATE_TIME_CATEGORY.SHORT_DATE]: {
    options: {
      [DATE_TIME_FORMAT_OPTIONS.WMDY]: {format: 'MM/DD/YYYY'},
      [DATE_TIME_FORMAT_OPTIONS.WDMY]: {format: 'DD/MM/YYYY'},
    },
  },
  [DATE_TIME_CATEGORY.LONG_DATE]: {
    options: {
      [DATE_TIME_FORMAT_OPTIONS.WMDY]: {
        format: 'ddd, MMM D, YYYY',
        label: 'Weekday, Month, Day, Year',
      },
      [DATE_TIME_FORMAT_OPTIONS.WDMY]: {
        format: 'ddd, D MMM YYYY',
        label: 'Weekday, Day, Month, Year',
      },
    },
  },
};

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
 * @param category - The category of the format.
 * @param key - The key for the specific format.
 * @returns The format string if found, otherwise undefined.
 */
export const getFormatString = (
  category: DateTimeCategory,
  key: DateTimeKey,
): string | undefined =>
  dateTimeFormatOptions[category].options[key as DateTimeFormatOptions]?.format;

/**
 * Formats a date with a given time zone and user setting date format.
 *
 * @param date - The date to format.
 * @param tz - The time zone.
 * @param userInterfaceDateFormat - The user setting date format.
 * @returns The formatted date string.
 */
export const shortDate = (
  date?: DateInput,
  tz?: string,
  userInterfaceDateFormat: DateTimeKey = SYSTEM_DEFAULT,
): string | undefined => {
  const dateFormatString = getFormatString(
    'shortDate',
    userInterfaceDateFormat,
  );

  const formatString =
    isDefined(dateFormatString) && userInterfaceDateFormat !== SYSTEM_DEFAULT
      ? dateFormatString
      : 'L';

  return getFormattedDate(date, formatString, tz);
};

/**
 * Formats a date with a given time zone and user setting formats.
 *
 * @param date - The date to format.
 * @param tz - The time zone.
 * @param userInterfaceTimeFormat - The user setting time format.
 * @param userInterfaceDateFormat - The user setting date format.
 * @returns The formatted date string.
 */

export const longDate = (
  date?: DateInput,
  tz?: string,
  userInterfaceTimeFormat: DateTimeKey = SYSTEM_DEFAULT,
  userInterfaceDateFormat: DateTimeKey = SYSTEM_DEFAULT,
): string | undefined => {
  const dateFormatString = getFormatString('longDate', userInterfaceDateFormat);
  const timeFormatString = getFormatString('time', userInterfaceTimeFormat);

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
 * Helper function to process a date with timezone information
 *
 * @param date - The date to format
 * @param tz - The timezone
 * @param userInterfaceTimeFormat - The user setting time format ('12' or '24')
 * @param userInterfaceDateFormat - The user setting date format ('wmdy' or 'wdmy')
 * @returns Object with formattedDate and tzDisplay properties or undefined
 */
export const processDateWithTimeZone = (
  date?: DateInput,
  tz?: string,
  userInterfaceTimeFormat: DateTimeKey = SYSTEM_DEFAULT,
  userInterfaceDateFormat: DateTimeKey = SYSTEM_DEFAULT,
): {formattedDate: string; tzDisplay: string | undefined} | undefined => {
  const dateObj = ensureDate(date);
  if (!isDefined(dateObj)) {
    return undefined;
  }

  const dateFormatString = getFormatString('longDate', userInterfaceDateFormat);
  const timeFormatString = getFormatString('time', userInterfaceTimeFormat);

  const useDefaultFormat =
    userInterfaceTimeFormat === SYSTEM_DEFAULT ||
    userInterfaceDateFormat === SYSTEM_DEFAULT ||
    (!isDefined(dateFormatString) && !isDefined(timeFormatString));

  const formatString = useDefaultFormat
    ? 'llll'
    : `${dateFormatString} ${timeFormatString}`;

  const formattedDate =
    isDefined(tz) && tz !== ''
      ? getFormattedDate(dateObj, formatString, tz)
      : getFormattedDate(dateObj, formatString);

  if (!isDefined(formattedDate)) {
    return undefined;
  }

  let tzDisplay: string | undefined = undefined;
  if (isDefined(tz) && tz !== '') {
    // If a timezone is provided, use it
    tzDisplay = dateObj.tz(tz).format('zzz');
    // @ts-expect-error
  } else if (dateObj.$x?.$timezone) {
    // Otherwise use the timezone from the date object if available
    tzDisplay = dateObj.format('zzz');
  }

  return {
    formattedDate,
    tzDisplay: tzDisplay ?? tz,
  };
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
  date?: DateInput,
  tz?: string,
  userInterfaceTimeFormat: DateTimeKey = SYSTEM_DEFAULT,
  userInterfaceDateFormat: DateTimeKey = SYSTEM_DEFAULT,
): string | undefined => {
  const result = processDateWithTimeZone(
    date,
    tz,
    userInterfaceTimeFormat,
    userInterfaceDateFormat,
  );
  if (!result) {
    return undefined;
  }

  const {formattedDate, tzDisplay} = result;
  return tzDisplay ? `${formattedDate} ${tzDisplay}` : formattedDate;
};

/**
 * Returns date and timezone as separate object properties for display on separate lines
 *
 * @param date - The date to format
 * @param tz - The timezone
 * @param userInterfaceTimeFormat - The user setting time format ('12' or '24')
 * @param userInterfaceDateFormat - The user setting date format ('wmdy' or 'wdmy')
 * @returns Object with datetime and timezone properties or undefined
 */
export const dateTimeWithTimeZoneObject = (
  date?: DateInput,
  tz?: string,
  userInterfaceTimeFormat: DateTimeKey = SYSTEM_DEFAULT,
  userInterfaceDateFormat: DateTimeKey = SYSTEM_DEFAULT,
): {datetime: string; timezone: string} | undefined => {
  const result = processDateWithTimeZone(
    date,
    tz,
    userInterfaceTimeFormat,
    userInterfaceDateFormat,
  );
  if (!result) {
    return undefined;
  }

  const {formattedDate, tzDisplay} = result;
  return {
    datetime: formattedDate,
    timezone: tzDisplay ?? '',
  };
};
