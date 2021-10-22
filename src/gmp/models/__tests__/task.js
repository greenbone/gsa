/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

  test('should parse undefined hosts_ordering', () => {
    const obj = {hosts_ordering: undefined};
    const task = Task.fromElement(obj);
    expect(task.hosts_ordering).toBeUndefined();
  });

  test('should parse unknown hosts_ordering as undefined', () => {
    const obj = {hosts_ordering: 'foo'};
    const task = Task.fromElement(obj);
    expect(task.hosts_ordering).toBeUndefined();
  });

  test('should parse known hosts_ordering', () => {
    let obj = {hosts_ordering: HOSTS_ORDERING_RANDOM};
    let task = Task.fromElement(obj);
    expect(task.hosts_ordering).toEqual(HOSTS_ORDERING_RANDOM);

    obj = {hosts_ordering: HOSTS_ORDERING_REVERSE};
    task = Task.fromElement(obj);
    expect(task.hosts_ordering).toEqual(HOSTS_ORDERING_REVERSE);

    obj = {hosts_ordering: HOSTS_ORDERING_SEQUENTIAL};
    task = Task.fromElement(obj);
    expect(task.hosts_ordering).toEqual(HOSTS_ORDERING_SEQUENTIAL);
  });

  test('should parse last_report', () => {
    const element = {
      _id: 't1',
      last_report: {
        report: {
          _id: 'r1',
        },
      },
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.last_report).toBeInstanceOf(Report);
    expect(task.last_report.id).toEqual('r1');
    expect(task.last_report.entityType).toEqual('report');
  });

  test('should parse current_report', () => {
    const element = {
      _id: 't1',
      current_report: {
        report: {
          _id: 'r1',
        },
      },
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.current_report).toBeInstanceOf(Report);
    expect(task.current_report.id).toEqual('r1');
    expect(task.current_report.entityType).toEqual('report');
  });

  test('should parse config', () => {
    const element = {
      _id: 't1',
      config: {
        _id: 'c1',
      },
    };

    const task = Task.fromElement(element);

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

    const task = Task.fromElement(element);

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

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.target).toBeInstanceOf(Model);
    expect(task.target.id).toEqual('t1');
    expect(task.target.entityType).toEqual('target');
  });

  test('should parse alerts', () => {
    const element = {
      _id: 't1',
      alert: [
        {
          _id: 'a1',
        },
        {
          _id: 'a2',
        },
      ],
    };

    const task = Task.fromElement(element);

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
        _id: 's1',
      },
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.scanner).toBeInstanceOf(Scanner);
    expect(task.scanner.id).toEqual('s1');
    expect(task.scanner.entityType).toEqual('scanner');
  });

  test('should parse schedule', () => {
    const element = {
      _id: 't1',
      schedule: {
        _id: 's1',
      },
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.schedule).toBeInstanceOf(Schedule);
    expect(task.schedule.id).toEqual('s1');
    expect(task.schedule.entityType).toEqual('schedule');
  });

  test('should parse report counts', () => {
    const element = {
      _id: 't1',
      report_count: {
        __text: '13',
        finished: '14',
      },
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.report_count.total).toEqual(13);
    expect(task.report_count.finished).toEqual(14);
  });

  test('should parse result counts', () => {
    const element = {
      _id: 't1',
      result_count: '666',
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.result_count).toEqual(666);
  });

  test('should parse schedule periods', () => {
    const element = {
      _id: 't1',
      schedule_periods: '666',
    };

    const task = Task.fromElement(element);

    expect(task.id).toEqual('t1');

    expect(task.schedule_periods).toEqual(666);
  });

  test('should parse progress', () => {
    const task1 = Task.fromElement({
      _id: 't1',
    });

    expect(task1.progress).toEqual(0);

    const task2 = Task.fromElement({
      _id: 't1',
      progress: {},
    });
    expect(task2.progress).toEqual(0);

    const task3 = Task.fromElement({
      _id: 't1',
      progress: {
        __text: '66',
      },
    });
    expect(task3.progress).toEqual(66);

    const task4 = Task.fromElement({
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
    const task1 = Task.fromElement({});
    const task2 = Task.fromElement({target: {_id: 'foo'}});

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
      const task = Task.fromElement({status});
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
      const task = Task.fromElement({status});
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
      const task = Task.fromElement({status});
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
      const task = Task.fromElement({status});
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
      const task = Task.fromElement({status});
      expect(task.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let task = Task.fromElement({status: TASK_STATUS.new, alterable: '0'});
    expect(task.isChangeable()).toEqual(true);

    task = Task.fromElement({status: TASK_STATUS.done, alterable: '1'});
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
