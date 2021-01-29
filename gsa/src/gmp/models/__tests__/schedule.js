/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable max-len */

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
    const errorLog = jest.fn();

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
