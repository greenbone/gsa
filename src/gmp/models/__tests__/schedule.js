/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Model from 'gmp/model';
import Schedule from 'gmp/models/schedule';
import {testModel} from 'gmp/models/testing';

describe('Schedule model tests', () => {
  testModel(Schedule, 'schedule');

  test('should delete legacy schedule fields', () => {
    const elem = {
      first_time: 'lorem',
      next_time: 'ipsum',
      duration: 'dolor',
      period: 'sit',
      periods: 'amet',
      period_months: 'consectetur',
      simple_duration: 'adipiscing',
      simple_period: 'elit',
    };
    const schedule = Schedule.fromElement(elem);

    expect(schedule.first_time).toBeUndefined();
    expect(schedule.next_time).toBeUndefined();
    expect(schedule.duration).toBeUndefined();
    expect(schedule.period).toBeUndefined();
    expect(schedule.periods).toBeUndefined();
    expect(schedule.period_months).toBeUndefined();
    expect(schedule.simple_duration).toBeUndefined();
    expect(schedule.simple_period).toBeUndefined();
  });

  test('should parse tasks', () => {
    const elem = {
      tasks: {
        task: [{id: '123'}],
      },
    };
    const schedule = Schedule.fromElement(elem);

    expect(schedule.tasks[0]).toBeInstanceOf(Model);
    expect(schedule.tasks[0].entityType).toEqual('task');
    expect(schedule.tasks[0].id).toEqual('123');
  });

  test('should handle invalid ical data safely', () => {
    /* eslint-disable no-console */
    const consoleError = console.log;
    const errorLog = testing.fn();

    console.error = errorLog;

    const elem = {
      _id: '123',
      icalendar: 'foobar',
    };
    const schedule = Schedule.fromElement(elem);

    expect(errorLog).toHaveBeenCalled();
    expect(schedule.event).toBeUndefined();

    console.error = consoleError;
    /* eslint-enable no-console */
  });
});
// vim: set ts=2 sw=2 tw=80:
