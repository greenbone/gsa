/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import date, {setLocale as locale} from '../../models/date';

import {
  setLocale,
  getLocale,
  shortDate,
  longDate,
  dateTimeWithTimeZone,
} from '../date';

describe('setLocale tests', () => {
  test('should change locale', () => {
    setLocale('en');
    let d = date('2018-01-01');
    expect(locale()).toEqual('en');
    expect(d.format('l')).toEqual('1/1/2018');

    setLocale('de');
    d = date('2018-01-01');
    expect(locale()).toEqual('de');
    expect(d.format('l')).toEqual('1.1.2018');
  });
});

describe('getLocale tests', () => {
  test('should return current locale', () => {
    setLocale('en');
    expect(getLocale()).toEqual('en');

    setLocale('de');
    expect(getLocale()).toEqual('de');
  });
});

describe('shortDate tests', () => {
  test('should return undefined', () => {
    expect(shortDate()).toBeUndefined();
  });

  test('should not parse invalid date', () => {
    expect(shortDate({})).toBeUndefined();
    expect(shortDate(null)).toBeUndefined();
  });

  test('should format date', () => {
    setLocale('en');
    const d = date('2018-01-01');
    expect(shortDate(d)).toEqual('01/01/2018');
  });

  test('should format string', () => {
    setLocale('en');
    expect(shortDate('2018-01-01')).toEqual('01/01/2018');
  });

  test('should format JS date', () => {
    const d = new Date('2018-01-01');
    setLocale('en');
    expect(shortDate(d)).toEqual('01/01/2018');
  });
});

describe('longDate tests', () => {
  test('should return undefined', () => {
    expect(longDate()).toBeUndefined();
  });

  test('should not parse invalid date', () => {
    expect(longDate({})).toBeUndefined();
    expect(longDate(null)).toBeUndefined();
  });

  test('should format date', () => {
    setLocale('en');
    const d = date('2018-01-01');
    expect(longDate(d)).toEqual('Mon, Jan 1, 2018 12:00 AM');
  });

  test('should format string', () => {
    setLocale('en');
    expect(longDate('2018-01-01')).toEqual('Mon, Jan 1, 2018 12:00 AM');
  });

  test('should format JS date', () => {
    const d = new Date('2018-01-01T00:00:00');
    setLocale('en');
    expect(longDate(d)).toEqual('Mon, Jan 1, 2018 12:00 AM');
  });
});

describe('dateTimeWithTimeZone tests', () => {
  test('should return undefined', () => {
    expect(dateTimeWithTimeZone()).toBeUndefined();
  });

  test('should not parse invalid date', () => {
    expect(dateTimeWithTimeZone({})).toBeUndefined();
    expect(dateTimeWithTimeZone(null)).toBeUndefined();
  });

  test('should format date', () => {
    setLocale('en');
    const d = date('2018-01-01T00:00:00+01:00').tz('CET');
    expect(dateTimeWithTimeZone(d)).toEqual('Mon, Jan 1, 2018 12:00 AM CET');
  });
});

// vim: set ts=2 sw=2 tw=80:
