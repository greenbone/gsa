/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';

import {isDefined, isString, isJsDate} from 'gmp/utils/identity';

import {parseDate} from 'gmp/parser';

import {setLocale as setMomentLocale, isDate} from 'gmp/models/date';

const log = logger.getLogger('gmp.locale.date');

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

export const dateTimeFormatOptions = {
  time: {12: 'h:mm A', 24: 'H:mm'},
  date: {wmdy: 'ddd, MMM D, YYYY', wdmy: 'ddd, D MMM YYYY'},
};

export const shortDate = (date, tz, userInterfaceDateFormat) => {
  const formatString = dateTimeFormatOptions.date[userInterfaceDateFormat]
    ? 'DD/MM/YYYY'
    : 'L';

  return getFormattedDate(date, formatString, tz);
};

export const longDate = (
  date,
  tz,
  userInterfaceTimeFormat,
  userInterfaceDateFormat,
) => {
  const formatString =
    dateTimeFormatOptions.date[userInterfaceDateFormat] &&
    dateTimeFormatOptions.time[userInterfaceTimeFormat]
      ? `${dateTimeFormatOptions.date[userInterfaceDateFormat]} ${dateTimeFormatOptions.time[userInterfaceTimeFormat]} z`
      : 'llll';

  return getFormattedDate(date, formatString, tz);
};

export const dateTimeWithTimeZone = (
  date,
  tz,
  userInterfaceTimeFormat,
  userInterfaceDateFormat,
) => {
  const formatString =
    dateTimeFormatOptions.date[userInterfaceDateFormat] &&
    dateTimeFormatOptions.time[userInterfaceTimeFormat]
      ? `${dateTimeFormatOptions.date[userInterfaceDateFormat]} ${dateTimeFormatOptions.time[userInterfaceTimeFormat]} z`
      : 'llll z';

  return getFormattedDate(date, formatString, tz);
};
