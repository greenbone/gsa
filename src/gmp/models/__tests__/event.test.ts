/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import Event, {isEvent, WeekDays} from 'gmp/models/event';

const ICAL_FORMAT = 'YYYYMMDD[T]HHmmss[Z]';
const ICAL_FORMAT_TZ = 'YYYYMMDD[T]HHmmss';

describe('Event model tests', () => {
  test('should create event from data', () => {
    const startDate = date('2019-07-16T04:00:00Z');
    const event = Event.fromData({startDate, uid: '123'}, 'Europe/Berlin');

    expect(event.isRecurring()).toEqual(false);
    expect(event.timezone).toEqual('Europe/Berlin');
    expect(event.startDate.isSame(startDate)).toEqual(true);
    expect(event.durationInSeconds).toEqual(0);
    expect(event.duration.asSeconds()).toEqual(0);
    expect(event.summary).toBeUndefined();
    expect(event.description).toBeUndefined();
    expect(event.toIcalString().split('\r\n').join('\n'))
      .toEqual(`BEGIN:VCALENDAR
PRODID:-//Greenbone.net//NONSGML Greenbone Security Assistant
VERSION:2.0
BEGIN:VEVENT
UID:123
DTSTART:20190716T040000Z
END:VEVENT
END:VCALENDAR`);
  });

  test('should parse event start from icalendar without timezone', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    const {startDate: eventStartDate} = event.event;

    expect(eventStartDate).toBeDefined();
    expect(eventStartDate.utcOffset()).toEqual(0);

    // no timezone in ical should be considered as datetime in passed timezone (Europe/Berlin)
    const {startDate} = event;
    expect(startDate.hour()).toEqual(4);
    expect(startDate.tz('UTC').hour()).toEqual(2);
  });

  test('should parse event start from icalendar using utc', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000Z
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event.event).toBeDefined();

    const {startDate: eventStartDate} = event.event;

    expect(eventStartDate).toBeDefined();
    expect(eventStartDate.utcOffset()).toEqual(0);

    const {startDate} = event;
    expect(startDate.hour()).toEqual(6);
    expect(startDate.tz('UTC').hour()).toEqual(4);
  });

  test('should calculate start date as next date for daily recurrence', () => {
    const now = date().tz('utc').minute(0).second(0).millisecond(0);
    const startDate = now.clone().add(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // next event should be start date
    expect(nextDate?.isSame(startDate)).toEqual(true);
  });

  test('should calculate next day as next day for daily recurrence', () => {
    const now = date().tz('utc').minute(0).second(0).millisecond(0);
    const startDate = now.clone().subtract(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // next event should be next day
    expect(nextDate?.isSame(startDate)).toEqual(false);
    expect(nextDate?.isAfter(startDate)).toEqual(true);

    const rDate = startDate.clone().add(1, 'day');
    expect(nextDate?.isSame(rDate)).toEqual(true);
  });

  test('should calculate start date as next date for no recurrence', () => {
    const now = date().tz('utc').minute(0).second(0).millisecond(0);
    const startDate = now.clone().add(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // next event should be start date
    expect(nextDate?.isSame(startDate)).toEqual(true);
  });

  test('should calculate no next date for no recurrence if start date is already over', () => {
    const startDate = date().tz('utc').minute(0).second(0).millisecond(0);
    const now = startDate.clone().add(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // there should be no next event
    expect(nextDate).toBeUndefined();
  });

  test('should calculate next date for daily recurrence when a timezone is used', () => {
    const tz = process.env.TZ;
    process.env.TZ = 'America/New_York'; // UTC-4 or UTC-5

    const now = date()
      .tz('America/New_York')
      .minute(0)
      .second(0)
      .millisecond(0);
    // The target date is in 2 hours.  If the recurrence calculation converts the current NY
    // time directly to UTC (for example 16h00 NY becomes 16h00 UTC) then the test will fail
    // because UTC is more than 2 hours ahead of NY.
    const expected = now.clone().add(2, 'hour');
    const start = expected.clone().subtract(24, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART;TZID=/America/New_York:${start.format(ICAL_FORMAT_TZ)}
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'America/New_York');

    const next = event.nextDate;

    expect(next?.isSame(expected)).toEqual(true);

    process.env.TZ = tz;
  });

  test('should allow to get the recurrence rule', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:20190716T040000Z
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR
`;
    const event = Event.fromIcal(icalendar, 'Europe/Berlin');
    expect(event.recurrence).toEqual({
      freq: 'DAILY',
      interval: 1,
      wkst: 2,
    });
  });
});

describe('WeekDays tests', () => {
  test('should create WeekDays from empty object', () => {
    const weekDays = new WeekDays();
    expect(weekDays.monday).toEqual(false);
    expect(weekDays.tuesday).toEqual(false);
    expect(weekDays.wednesday).toEqual(false);
    expect(weekDays.thursday).toEqual(false);
    expect(weekDays.friday).toEqual(false);
    expect(weekDays.saturday).toEqual(false);
    expect(weekDays.sunday).toEqual(false);
    expect(weekDays.get('monday')).toEqual(false);
    expect(weekDays.get('tuesday')).toEqual(false);
    expect(weekDays.get('wednesday')).toEqual(false);
    expect(weekDays.get('thursday')).toEqual(false);
    expect(weekDays.get('friday')).toEqual(false);
    expect(weekDays.get('saturday')).toEqual(false);
    expect(weekDays.get('sunday')).toEqual(false);
    expect(weekDays.isDefault()).toEqual(true);
    expect(weekDays.getSelectedWeekDay()).toBeUndefined();
    expect(weekDays.values()).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(weekDays.toByDate()).toEqual([]);
    expect(weekDays.entries()).toEqual([
      ['monday', false],
      ['tuesday', false],
      ['wednesday', false],
      ['thursday', false],
      ['friday', false],
      ['saturday', false],
      ['sunday', false],
    ]);
  });

  test('should create WeekDay', () => {
    const weekDays = new WeekDays({
      monday: true,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    });
    expect(weekDays.monday).toEqual(true);
    expect(weekDays.tuesday).toEqual(2);
    expect(weekDays.wednesday).toEqual(3);
    expect(weekDays.thursday).toEqual(4);
    expect(weekDays.friday).toEqual(5);
    expect(weekDays.saturday).toEqual(6);
    expect(weekDays.sunday).toEqual(7);
    expect(weekDays.get('monday')).toEqual(true);
    expect(weekDays.get('tuesday')).toEqual(2);
    expect(weekDays.get('wednesday')).toEqual(3);
    expect(weekDays.get('thursday')).toEqual(4);
    expect(weekDays.get('friday')).toEqual(5);
    expect(weekDays.get('saturday')).toEqual(6);
    expect(weekDays.get('sunday')).toEqual(7);
    expect(weekDays.isDefault()).toEqual(false);
    expect(weekDays.getSelectedWeekDay()).toEqual('monday');
    expect(weekDays.values()).toEqual([true, 2, 3, 4, 5, 6, 7]);
    expect(weekDays.toByDate()).toEqual([
      'MO',
      '2TU',
      '3WE',
      '4TH',
      '5FR',
      '6SA',
      '7SU',
    ]);
    expect(weekDays.entries()).toEqual([
      ['monday', true],
      ['tuesday', 2],
      ['wednesday', 3],
      ['thursday', 4],
      ['friday', 5],
      ['saturday', 6],
      ['sunday', 7],
    ]);
  });

  test('should allow to copy WeekDays', () => {
    const weekDays = new WeekDays({
      monday: true,
    });
    const copy = weekDays.copy();
    expect(copy).toEqual(weekDays);
    expect(copy).not.toBe(weekDays);
    expect(copy.isDefault()).toEqual(false);
    expect(copy.getSelectedWeekDay()).toEqual('monday');
  });

  test('should allow to set week day', () => {
    const weekDays = new WeekDays();
    const copy = weekDays.setWeekDay('monday', true);
    expect(weekDays.monday).toEqual(false);
    expect(weekDays.get('monday')).toEqual(false);
    expect(weekDays.getSelectedWeekDay()).toBeUndefined();
    expect(copy.monday).toEqual(true);
    expect(copy.get('monday')).toEqual(true);
    expect(copy.getSelectedWeekDay()).toEqual('monday');
  });

  test('should allow to set week day from date', () => {
    const weekDays = new WeekDays();
    const copy = weekDays.setWeekDayFromDate(date('2024-01-01'), 2);
    expect(weekDays.monday).toEqual(false);
    expect(weekDays.get('monday')).toEqual(false);
    expect(weekDays.getSelectedWeekDay()).toBeUndefined();
    expect(copy.monday).toEqual(2);
    expect(copy.get('monday')).toEqual(2);
    expect(copy.getSelectedWeekDay()).toEqual('monday');
  });
});

describe('isEvent tests', () => {
  test('should return true for valid event', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');
    expect(isEvent(event)).toEqual(true);
  });

  test('should return false for invalid event', () => {
    expect(isEvent({})).toEqual(false);
    expect(isEvent(false)).toEqual(false);
    expect(isEvent(null)).toEqual(false);
    expect(isEvent(undefined)).toEqual(false);
  });
});
