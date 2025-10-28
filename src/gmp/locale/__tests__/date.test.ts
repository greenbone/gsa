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
  dateTimeWithTimeZoneObject,
  processDateWithTimeZone,
  type DateTimeKey,
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
    // @ts-expect-error
    expect(shortDate({})).toBeUndefined();
    // @ts-expect-error
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
        expect(
          shortDate(input, tz, userInterfaceDateFormat as DateTimeKey),
        ).toEqual(expected);
      },
    );
  });
});

describe('longDate tests', () => {
  test('should return undefined', () => {
    expect(longDate()).toBeUndefined();
  });

  test('should not parse invalid date', () => {
    // @ts-expect-error
    expect(longDate({})).toBeUndefined();
    // @ts-expect-error
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
          longDate(
            input,
            tz,
            userInterfaceTimeFormat as DateTimeKey,
            userInterfaceDateFormat as DateTimeKey,
          ),
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
    // @ts-expect-error
    expect(dateTimeWithTimeZone({})).toBeUndefined();
    // @ts-expect-error
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
            // @ts-expect-error
            userInterfaceTimeFormat,
            userInterfaceDateFormat,
          ),
        ).toEqual(expected);
      },
    );
  });
});

describe('dateTimeWithTimeZoneObject tests', () => {
  test('should return undefined', () => {
    expect(dateTimeWithTimeZoneObject()).toBeUndefined();
  });

  test('should not parse invalid date', () => {
    // @ts-expect-error
    expect(dateTimeWithTimeZoneObject({})).toBeUndefined();
    // @ts-expect-error
    expect(dateTimeWithTimeZoneObject(null)).toBeUndefined();
  });

  test('should format date with timezone as object', () => {
    setDateLocale('en');
    const d = date('2018-01-01T00:00:00+01:00').tz('CET');
    const result = dateTimeWithTimeZoneObject(d);

    expect(result).toEqual({
      datetime: 'Mon, Jan 1, 2018 12:00 AM',
      timezone: 'Central European Standard Time',
    });
  });

  test('should format date locale with timezone as object', () => {
    setDateLocale('de');
    const result = dateTimeWithTimeZoneObject(
      date('2018-11-24T15:30:00Z'),
      'UTC',
      'system_default',
      'system_default',
    );

    expect(result).toEqual({
      datetime: 'Sa., 24. Nov. 2018 15:30',
      timezone: 'Coordinated Universal Time',
    });
  });

  describe('dateTimeWithTimeZoneObject tests', () => {
    beforeEach(() => {
      setDateLocale('en');
    });

    test.each([
      [
        new Date('2018-11-23T00:00:00'),
        undefined,
        undefined,
        undefined,
        {
          datetime: 'Fri, Nov 23, 2018 12:00 AM',
          timezone: '',
        },
      ],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        12,
        'wdmy',
        {
          datetime: 'Sat, 24 Nov 2018 3:30 PM',
          timezone: 'Coordinated Universal Time',
        },
      ],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        24,
        'wmdy',
        {
          datetime: 'Sat, Nov 24, 2018 15:30',
          timezone: 'Coordinated Universal Time',
        },
      ],
      [
        '2018-11-24T15:30:00Z',
        'UTC',
        'system_default',
        'system_default',
        {
          datetime: 'Sat, Nov 24, 2018 3:30 PM',
          timezone: 'Coordinated Universal Time',
        },
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
          dateTimeWithTimeZoneObject(
            input,
            tz,
            // @ts-expect-error
            userInterfaceTimeFormat,
            userInterfaceDateFormat,
          ),
        ).toEqual(expected);
      },
    );
  });
});

describe('processDateWithTimeZone tests', () => {
  test('should return undefined', () => {
    expect(processDateWithTimeZone()).toBeUndefined();
  });

  test('should not process invalid date', () => {
    // @ts-expect-error
    expect(processDateWithTimeZone({})).toBeUndefined();
    // @ts-expect-error
    expect(processDateWithTimeZone(null)).toBeUndefined();
  });

  test('should process date with timezone correctly', () => {
    setDateLocale('en');
    const d = date('2018-01-01T00:00:00+01:00').tz('CET');
    const result = processDateWithTimeZone(d, 'CET');

    expect(result).toEqual({
      formattedDate: 'Mon, Jan 1, 2018 12:00 AM',
      tzDisplay: 'Central European Standard Time',
    });
  });

  test('should handle empty timezone', () => {
    setDateLocale('en');
    const d = date('2018-01-01T00:00:00');
    const result = processDateWithTimeZone(d, '');

    expect(result).toEqual({
      formattedDate: 'Mon, Jan 1, 2018 12:00 AM',
      tzDisplay: '',
    });
  });

  test('should apply custom time format (12h)', () => {
    setDateLocale('en');
    const d = date('2018-01-01T13:30:00Z');
    const result = processDateWithTimeZone(d, 'UTC', '12', 'wmdy');

    expect(result).toEqual({
      formattedDate: 'Mon, Jan 1, 2018 1:30 PM',
      tzDisplay: 'Coordinated Universal Time',
    });
  });

  test('should apply custom time format (24h)', () => {
    setDateLocale('en');
    const d = date('2018-01-01T13:30:00Z');
    const result = processDateWithTimeZone(d, 'UTC', '24', 'wmdy');

    expect(result).toEqual({
      formattedDate: 'Mon, Jan 1, 2018 13:30',
      tzDisplay: 'Coordinated Universal Time',
    });
  });

  test('should apply custom date format (wdmy)', () => {
    setDateLocale('en');
    const d = date('2018-01-01T13:30:00Z');
    const result = processDateWithTimeZone(d, 'UTC', '24', 'wdmy');

    expect(result).toEqual({
      formattedDate: 'Mon, 1 Jan 2018 13:30',
      tzDisplay: 'Coordinated Universal Time',
    });
  });

  test('should handle different locales', () => {
    setDateLocale('de');
    const d = date('2018-01-01T13:30:00Z');
    const result = processDateWithTimeZone(
      d,
      'UTC',
      'system_default',
      'system_default',
    );

    expect(result?.tzDisplay).toEqual('Coordinated Universal Time');
    // The formatted date will be in German format
    expect(result?.formattedDate).toContain('1. Jan. 2018');
  });
});
