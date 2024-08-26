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

export const shortDate = (date, tz) => getFormattedDate(date, 'L', tz);

export const longDate = (date, tz) => getFormattedDate(date, 'llll', tz);

export const dateTimeWithTimeZone = (date, tz, timeFormat, dateFormat) => {
  const timeFormats = {
    12: 'hh:mm A',
    24: 'HH:mm',
  };

  const dateFormats = {
    wmdy: 'ddd, MMM DD, YYYY',
    wdmy: 'ddd, DD MMM YYYY',
  };

  const timePart = timeFormats[timeFormat] || 'HH:mm';
  const datePart = dateFormats[dateFormat] || 'DD MMM YYYY';
  const formatString = `${datePart} ${timePart} z`;

  return getFormattedDate(date, formatString, tz);
};

// vim: set ts=2 sw=2 tw=80:
