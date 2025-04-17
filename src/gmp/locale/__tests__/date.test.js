/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeEach} from '@gsa/testing';
import {
  setDateLocale,
  getDateLocale,
  shortDate,
  longDate,
  dateTimeWithTimeZone,
} from 'gmp/locale/date';
import date, {setLocaleDayjs} from 'gmp/models/date';

describe('setLocale tests', () => {
  test('should change locale', () => {
    setDateLocale('en');
    let d = date('2018-01-01');
    expect(setLocaleDayjs()).toEqual('en');
    expect(d.format('l')).toEqual('1/1/2018');

    setDateLocale('de');
    d = date('2018-01-01');
    expect(setLocaleDayjs()).toEqual('de');
    expect(d.format('l')).toEqual('1.1.2018');
  });
});

describe('getDateLocale tests', () => {
  test('should return current locale', () => {
    setDateLocale('en');
    expect(getDateLocale()).toEqual('en');

    setDateLocale('de');
    expect(getDateLocale()).toEqual('de');
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
    setDateLocale('en');
    const d = date('2018-01-01');
    expect(shortDate(d)).toEqual('01/01/2018');
  });

  test('should format date locale', () => {
    setDateLocale('de');
    expect(
      shortDate(date('2018-11-24T15:30:00Z'), 'UTC', 'system_default'),
    ).toEqual('24.11.2018');
  });

  describe('shortDate tests', () => {
    beforeEach(() => {
      setDateLocale('en');
    });

    test.each([
      ['2018-01-01', undefined, undefined, '01/01/2018'],
      [new Date('2018-01-01'), undefined, undefined, '01/01/2018'],
      [new Date('2018-11-24'), undefined, 'wmdy', '11/24/2018'],
      [new Date('2018-11-24'), undefined, 'wdmy', '24/11/2018'],
      [new Date('2018-11-24'), undefined, 'system_default', '11/24/2018'],
    ])(
      'should format date %p with tz %p and userInterfaceDateFormat %p to %p',
      (input, tz, userInterfaceDateFormat, expected) => {
        expect(shortDate(input, tz, userInterfaceDateFormat)).toEqual(expected);
      },
    );
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
    setDateLocale('en');
    const d = date('2018-01-01');
    expect(longDate(d)).toEqual('Mon, Jan 1, 2018 12:00 AM');
  });

  test('should format date locale', () => {
    setDateLocale('de');
    expect(
      longDate(
        date('2018-11-24T15:30:00Z'),
        'UTC',
        'system_default',
        'system_default',
      ),
    ).toEqual('Sa., 24. Nov. 2018 15:30');
  });

  describe('longDate tests', () => {
    beforeEach(() => {
      setDateLocale('en');
    });

    test.each([
      [
        '2018-11-24',
        undefined,
        undefined,
        undefined,
        'Sat, Nov 24, 2018 12:00 AM',
      ],
      [
        new Date('2018-11-23T00:00:00'),
        undefined,
        undefined,
        undefined,
        'Fri, Nov 23, 2018 12:00 AM',
      ],
      ['2018-11-24T15:30:00Z', 'UTC', 12, 'wdmy', 'Sat, 24 Nov 2018 3:30 PM'],
      ['2018-11-24T15:30:00Z', 'UTC', 24, 'wmdy', 'Sat, Nov 24, 2018 15:30'],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        'system_default',
        'system_default',
        'Sat, Nov 24, 2018 3:30 PM',
      ],
    ])(
      'should format date %p with tz %p, userInterfaceTimeFormat %p, and userInterfaceDateFormat %p to %p',
      (
        input,
        tz,
        userInterfaceTimeFormat,
        userInterfaceDateFormat,
        expected,
      ) => {
        expect(
          longDate(input, tz, userInterfaceTimeFormat, userInterfaceDateFormat),
        ).toEqual(expected);
      },
    );
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
    setDateLocale('en');
    const d = date('2018-01-01T00:00:00+01:00').tz('CET');
    expect(dateTimeWithTimeZone(d)).toEqual(
      'Mon, Jan 1, 2018 12:00 AM Central European Standard Time',
    );
  });

  test('should format date locale', () => {
    setDateLocale('de');
    expect(
      dateTimeWithTimeZone(
        date('2018-11-24T15:30:00Z'),
        'UTC',
        'system_default',
        'system_default',
      ),
    ).toEqual('Sa., 24. Nov. 2018 15:30 Coordinated Universal Time');
  });

  describe('dateTimeWithTimeZone tests', () => {
    beforeEach(() => {
      setDateLocale('en');
    });

    test.each([
      [
        new Date('2018-11-23T00:00:00'),
        undefined,
        undefined,
        undefined,
        'Fri, Nov 23, 2018 12:00 AM',
      ],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        12,
        'wdmy',
        'Sat, 24 Nov 2018 3:30 PM Coordinated Universal Time',
      ],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        24,
        'wmdy',
        'Sat, Nov 24, 2018 15:30 Coordinated Universal Time',
      ],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        'system_default',
        'system_default',
        'Sat, Nov 24, 2018 3:30 PM Coordinated Universal Time',
      ],
    ])(
      'should format date %p with tz %p, userInterfaceTimeFormat %p, and userInterfaceDateFormat %p to %p',
      (
        input,
        tz,
        userInterfaceTimeFormat,
        userInterfaceDateFormat,
        expected,
      ) => {
        expect(
          dateTimeWithTimeZone(
            input,
            tz,
            userInterfaceTimeFormat,
            userInterfaceDateFormat,
          ),
        ).toEqual(expected);
      },
    );
  });
});
