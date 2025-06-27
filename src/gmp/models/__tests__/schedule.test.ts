/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import Schedule from 'gmp/models/schedule';
import {testModel} from 'gmp/models/testing';

describe('Schedule model tests', () => {
  testModel(Schedule, 'schedule');

  test('should use defaults', () => {
    const schedule = new Schedule();
    expect(schedule.event).toBeUndefined();
    expect(schedule.tasks).toEqual([]);
    expect(schedule.timezone).toBeUndefined();
    expect(schedule.timezone_abbrev).toBeUndefined();
  });

  test('should parse empty element', () => {
    const schedule = Schedule.fromElement();
    expect(schedule.event).toBeUndefined();
    expect(schedule.tasks).toEqual([]);
    expect(schedule.timezone).toBeUndefined();
    expect(schedule.timezone_abbrev).toBeUndefined();
  });

  test('should parse tasks', () => {
    const schedule = Schedule.fromElement({
      tasks: {
        task: [{_id: '123'}],
      },
    });
    expect(schedule.tasks[0].entityType).toEqual('task');
    expect(schedule.tasks[0].id).toEqual('123');
  });

  test('should handle invalid ical data safely', () => {
    // eslint-disable-next-line no-console
    const consoleError = console.log;
    const errorLog = testing.fn();

    console.error = errorLog;

    const schedule = Schedule.fromElement({
      _id: '123',
      icalendar: 'foobar',
    });

    expect(errorLog).toHaveBeenCalled();
    expect(schedule.event).toBeUndefined();

    console.error = consoleError;
  });

  test('should parse timezone and timezone_abbrev', () => {
    const schedule = Schedule.fromElement({
      timezone: 'Europe/Berlin',
      timezone_abbrev: 'CET',
    });
    expect(schedule.timezone).toEqual('Europe/Berlin');
    expect(schedule.timezone_abbrev).toEqual('CET');
  });

  test('should parse event', () => {
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
    const schedule = Schedule.fromElement({
      icalendar,
      timezone: 'Europe/Berlin',
    });
    expect(schedule.event).toBeDefined();
    expect(schedule.event?.startDate).toEqual(
      date('2019-07-16T04:00:00Z').tz('Europe/Berlin'),
    );
    expect(schedule.event?.timezone).toEqual('Europe/Berlin');
  });
});
