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

import 'core-js/fn/object/entries';

import Task, {
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  HOSTS_ORDERING_SEQUENTIAL,
  TASK_STATUS,
} from 'gmp/models/task';
import {testModelProperties} from '../testing';

testModelProperties(Task, 'task', {testIsActive: false});

describe('Task model tests', () => {
  test('should parse undefined hosts_ordering', () => {
    const obj = {hosts_ordering: undefined};
    const task = new Task(obj);
    expect(task.hosts_ordering).toBeUndefined();
  });

  test('should parse unknown hosts_ordering as undefined', () => {
    const obj = {hosts_ordering: 'foo'};
    const task = new Task(obj);
    expect(task.hosts_ordering).toBeUndefined();
  });

  test('should parse known hosts_ordering', () => {
    let obj = {hosts_ordering: HOSTS_ORDERING_RANDOM};
    let task = new Task(obj);
    expect(task.hosts_ordering).toEqual(HOSTS_ORDERING_RANDOM);

    obj = {hosts_ordering: HOSTS_ORDERING_REVERSE};
    task = new Task(obj);
    expect(task.hosts_ordering).toEqual(HOSTS_ORDERING_REVERSE);

    obj = {hosts_ordering: HOSTS_ORDERING_SEQUENTIAL};
    task = new Task(obj);
    expect(task.hosts_ordering).toEqual(HOSTS_ORDERING_SEQUENTIAL);
  });
});

describe(`Task Model methods tests`, () => {
  test('should be a container if target_id is not set', () => {
    const task1 = new Task({});
    const task2 = new Task({target: {_id: 'foo'}});

    expect(task1.isContainer()).toEqual(true);
    expect(task2.isContainer()).toEqual(false);
  });

  test('should use status for isActive', () => {
    const statusList = {
      [TASK_STATUS.running]: true,
      [TASK_STATUS.stoprequested]: true,
      [TASK_STATUS.deleterequested]: true,
      [TASK_STATUS.ultimatedeleterequested]: true,
      [TASK_STATUS.resumerequested]: true,
      [TASK_STATUS.requested]: true,
      [TASK_STATUS.stopped]: false,
      [TASK_STATUS.new]: false,
      [TASK_STATUS.interrupted]: false,
      [TASK_STATUS.container]: false,
      [TASK_STATUS.uploading]: false,
      [TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status});
      expect(task.isActive()).toEqual(exp);
    }
  });

  test('should use status for isRunning', () => {
    const statusList = {
      [TASK_STATUS.running]: true,
      [TASK_STATUS.stoprequested]: false,
      [TASK_STATUS.deleterequested]: false,
      [TASK_STATUS.ultimatedeleterequested]: false,
      [TASK_STATUS.resumerequested]: false,
      [TASK_STATUS.requested]: false,
      [TASK_STATUS.stopped]: false,
      [TASK_STATUS.new]: false,
      [TASK_STATUS.interrupted]: false,
      [TASK_STATUS.container]: false,
      [TASK_STATUS.uploading]: false,
      [TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status});
      expect(task.isRunning()).toEqual(exp);
    }
  });

  test('should use status for isStopped', () => {
    const statusList = {
      [TASK_STATUS.running]: false,
      [TASK_STATUS.stoprequested]: false,
      [TASK_STATUS.deleterequested]: false,
      [TASK_STATUS.ultimatedeleterequested]: false,
      [TASK_STATUS.resumerequested]: false,
      [TASK_STATUS.requested]: false,
      [TASK_STATUS.stopped]: true,
      [TASK_STATUS.new]: false,
      [TASK_STATUS.interrupted]: false,
      [TASK_STATUS.container]: false,
      [TASK_STATUS.uploading]: false,
      [TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status});
      expect(task.isStopped()).toEqual(exp);
    }
  });

  test('should use status for isInterrupted', () => {
    const statusList = {
      [TASK_STATUS.running]: false,
      [TASK_STATUS.stoprequested]: false,
      [TASK_STATUS.deleterequested]: false,
      [TASK_STATUS.ultimatedeleterequested]: false,
      [TASK_STATUS.resumerequested]: false,
      [TASK_STATUS.requested]: false,
      [TASK_STATUS.stopped]: false,
      [TASK_STATUS.new]: false,
      [TASK_STATUS.interrupted]: true,
      [TASK_STATUS.container]: false,
      [TASK_STATUS.uploading]: false,
      [TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status});
      expect(task.isInterrupted()).toEqual(exp);
    }
  });

  test('should use status for isNew', () => {
    const statusList = {
      [TASK_STATUS.running]: false,
      [TASK_STATUS.stoprequested]: false,
      [TASK_STATUS.deleterequested]: false,
      [TASK_STATUS.ultimatedeleterequested]: false,
      [TASK_STATUS.resumerequested]: false,
      [TASK_STATUS.requested]: false,
      [TASK_STATUS.stopped]: false,
      [TASK_STATUS.new]: true,
      [TASK_STATUS.interrupted]: false,
      [TASK_STATUS.container]: false,
      [TASK_STATUS.uploading]: false,
      [TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status});
      expect(task.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let task = new Task({status: TASK_STATUS.new, alterable: '0'});
    expect(task.isChangeable()).toEqual(true);

    task = new Task({status: TASK_STATUS.done, alterable: '1'});
    expect(task.isChangeable()).toEqual(true);
  });
});
