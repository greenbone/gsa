/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

/* eslint-disable max-len */

import Model from 'gmp/model';
import Schedule from 'gmp/models/schedule';
import {testModel} from 'gmp/models/testing';

testModel(Schedule, 'schedule');

describe('Schedule model tests', () => {
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
    const schedule = new Schedule(elem);

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
    const schedule = new Schedule(elem);

    expect(schedule.tasks[0]).toBeInstanceOf(Model);
    expect(schedule.tasks[0].entityType).toEqual('task');
  });
});
// vim: set ts=2 sw=2 tw=80:
