/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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

  test('should format date', () => {
    setLocale('en');
    const d = date('2018-01-01T00:00:00+01:00').tz('CET');
    expect(dateTimeWithTimeZone(d)).toEqual('Mon, Jan 1, 2018 12:00 AM CET');
  });

});

// vim: set ts=2 sw=2 tw=80:
