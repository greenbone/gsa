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

import 'core-js/features/object/entries';

import Model from 'gmp/model';

import Task, {
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  HOSTS_ORDERING_SEQUENTIAL,
  TASK_STATUS,
} from 'gmp/models/task';

import Report from '../report';
import Scanner from '../scanner';
import Schedule from '../schedule';

import {testModel} from '../testing';

describe('Task Model parse tests', () => {
  testModel(Task, 'task', {testIsActive: false});

  test('should parse undefined hostsOrdering', () => {
    const obj = {hostsOrdering: undefined};
    const task = Task.fromObject(obj);
    expect(task.hostsOrdering).toBeUndefined();
  });

  test('should parse unknown hostsOrdering as undefined', () => {
    const obj = {hostsOrdering: 'foo'};
    const task = Task.fromObject(obj);
    expect(task.hostsOrdering).toBeUndefined();
  });

  test('should parse known hostsOrdering', () => {
    let obj = {hostsOrdering: HOSTS_ORDERING_RANDOM};
    let task = Task.fromObject(obj);
    expect(task.hostsOrdering).toEqual(HOSTS_ORDERING_RANDOM);

    obj = {hostsOrdering: HOSTS_ORDERING_REVERSE};
    task = Task.fromObject(obj);
    expect(task.hostsOrdering).toEqual(HOSTS_ORDERING_REVERSE);

    obj = {hostsOrdering: HOSTS_ORDERING_SEQUENTIAL};
    task = Task.fromObject(obj);
    expect(task.hostsOrdering).toEqual(HOSTS_ORDERING_SEQUENTIAL);
  });

  test('should parse lastReport', () => {
    const element = {
      _id: 't1',
      lastReport: {
        uuid: 'r1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.lastReport).toBeInstanceOf(Report);
    expect(task.lastReport.id).toEqual('r1');
    expect(task.lastReport.entityType).toEqual('report');
  });

  test('should parse current_report', () => {
    const element = {
      _id: 't1',
      currentReport: {
        uuid: 'r1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.currentReport).toBeInstanceOf(Report);
    expect(task.currentReport.id).toEqual('r1');
    expect(task.currentReport.entityType).toEqual('report');
  });

  test('should parse config', () => {
    const element = {
      _id: 't1',
      scanConfig: {
        _id: 'c1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.config).toBeInstanceOf(Model);
    expect(task.config.id).toEqual('c1');
    expect(task.config.entityType).toEqual('scanconfig');
  });

  test('should parse slave', () => {
    const element = {
      _id: 't1',
      slave: {
        _id: 's1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.slave).toBeInstanceOf(Model);
    expect(task.slave.id).toEqual('s1');
    expect(task.slave.entityType).toEqual('slave');
  });

  test('should parse target', () => {
    const element = {
      _id: 't1',
      target: {
        _id: 't1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.target).toBeInstanceOf(Model);
    expect(task.target.id).toEqual('t1');
    expect(task.target.entityType).toEqual('target');
  });

  test('should parse alerts', () => {
    const element = {
      _id: 't1',
      alerts: [
        {
          _id: 'a1',
        },
        {
          _id: 'a2',
        },
      ],
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.alerts[0]).toBeInstanceOf(Model);
    expect(task.alerts[0].id).toEqual('a1');
    expect(task.alerts[0].entityType).toEqual('alert');
    expect(task.alerts[1]).toBeInstanceOf(Model);
    expect(task.alerts[1].entityType).toEqual('alert');
    expect(task.alerts[1].id).toEqual('a2');
  });

  test('should parse scanner', () => {
    const element = {
      _id: 't1',
      scanner: {
        uuid: 's1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.scanner).toBeInstanceOf(Scanner);
    expect(task.scanner.id).toEqual('s1');
    expect(task.scanner.entityType).toEqual('scanner');
  });

  test('should parse schedule', () => {
    const element = {
      _id: 't1',
      schedule: {
        uuid: 's1',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.schedule).toBeInstanceOf(Schedule);
    expect(task.schedule.id).toEqual('s1');
    expect(task.schedule.entityType).toEqual('schedule');
  });

  test('should parse report counts', () => {
    const element = {
      uuid: 't1',
      reportCount: {
        total: '13',
        finished: '14',
      },
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.reportCount.total).toEqual(13);
    expect(task.reportCount.finished).toEqual(14);
  });

  test('should parse result counts', () => {
    const element = {
      _id: 't1',
      resultCount: '666',
    };

    const task = Task.fromObject(element);

    expect(task.id).toEqual('t1');

    expect(task.resultCount).toEqual(666);
  });

  test('should parse progress', () => {
    const task1 = Task.fromObject({
      _id: 't1',
    });

    expect(task1.progress).toEqual(0);

    const task2 = Task.fromObject({
      _id: 't1',
      progress: {},
    });
    expect(task2.progress).toEqual(0);

    const task3 = Task.fromObject({
      _id: 't1',
      progress: {
        __text: '66',
      },
    });
    expect(task3.progress).toEqual(66);

    const task4 = Task.fromObject({
      _id: 't1',
      progress: '66',
    });
    expect(task4.progress).toEqual(66);
  });

  test('should parse preferences', () => {
    const task1 = Task.fromElement({
      _id: 't1',
      preferences: {
        preference: [
          {
            scanner_name: 'in_assets',
            value: 'yes',
          },
          {
            scanner_name: 'assets_apply_overrides',
            value: 'yes',
          },
          {
            scanner_name: 'assets_min_qod',
            value: '70',
          },
          {
            scanner_name: 'auto_delete',
            value: 'keep',
          },
          {
            scanner_name: 'auto_delete_data',
            value: 0,
          },
          {
            scanner_name: 'max_hosts',
            value: '20',
          },
          {
            scanner_name: 'max_checks',
            value: '4',
          },
          {
            scanner_name: 'source_iface',
            value: 'eth0',
          },
          {
            scanner_name: 'foo',
            value: 'bar',
            name: 'lorem',
          },
        ],
      },
    });
    const task2 = Task.fromElement({
      _id: 't1',
      preferences: {
        preference: [
          {
            scanner_name: 'in_assets',
            value: 'no',
          },
          {
            scanner_name: 'assets_apply_overrides',
            value: 'no',
          },
          {
            scanner_name: 'auto_delete',
            value: 'no',
          },
          {
            scanner_name: 'auto_delete_data',
            value: 3,
          },
        ],
      },
    });

    expect(task1.in_assets).toEqual(1);
    expect(task1.apply_overrides).toEqual(1);
    expect(task1.min_qod).toEqual(70);
    expect(task1.auto_delete).toEqual('keep');
    expect(task1.max_hosts).toEqual(20);
    expect(task1.max_checks).toEqual(4);
    expect(task1.source_iface).toEqual('eth0');
    expect(task1.preferences).toEqual({foo: {value: 'bar', name: 'lorem'}});
    expect(task2.in_assets).toEqual(0);
    expect(task2.apply_overrides).toEqual(0);
    expect(task2.auto_delete).toEqual('no');
    expect(task2.auto_delete_data).toEqual(3);
  });
});

describe(`Task Model methods tests`, () => {
  test('should be a container if target_id is not set', () => {
    const task1 = Task.fromObject({});
    const task2 = Task.fromObject({target: {_id: 'foo'}});

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
      const task = Task.fromObject({status});
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
      const task = Task.fromObject({status});
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
      const task = Task.fromObject({status});
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
      const task = Task.fromObject({status});
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
      const task = Task.fromObject({status});
      expect(task.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let task = Task.fromObject({status: TASK_STATUS.new, alterable: '0'});
    expect(task.isChangeable()).toEqual(true);

    task = Task.fromObject({status: TASK_STATUS.done, alterable: '1'});
    expect(task.isChangeable()).toEqual(true);
  });

  test('should parse observer strings', () => {
    const task = Task.fromElement({
      observers: 'foo bar',
    });

    const {observers} = task;
    expect(observers.user).toEqual(['foo', 'bar']);
  });
  test('should parse all observers types', () => {
    const task = Task.fromElement({
      observers: {
        __text: 'anon nymous',
        role: [{name: 'lorem'}],
        group: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const {observers} = task;

    expect(observers.user).toEqual(['anon', 'nymous']);
    expect(observers.role).toEqual([{name: 'lorem'}]);
    expect(observers.group).toEqual([{name: 'ipsum'}, {name: 'dolor'}]);
  });
});
