/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Task, {
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  HOSTS_ORDERING_SEQUENTIAL,
  TASK_STATUS,
  TaskStatus,
  USAGE_TYPE,
} from 'gmp/models/task';
import {testModel} from 'gmp/models/testing';
import {parseDuration} from 'gmp/parser';

describe('Task Model parse tests', () => {
  testModel(Task, 'task', {testIsActive: false});

  test('should use defaults', () => {
    const task = new Task();
    expect(task.alerts).toEqual([]);
    expect(task.alterable).toBeUndefined();
    expect(task.apply_overrides).toBeUndefined();
    expect(task.auto_delete).toBeUndefined();
    expect(task.auto_delete_data).toBeUndefined();
    expect(task.average_duration).toBeUndefined();
    expect(task.config).toBeUndefined();
    expect(task.current_report).toBeUndefined();
    expect(task.hosts_ordering).toBeUndefined();
    expect(task.in_assets).toBeUndefined();
    expect(task.last_report).toBeUndefined();
    expect(task.max_checks).toBeUndefined();
    expect(task.max_hosts).toBeUndefined();
    expect(task.min_qod).toBeUndefined();
    expect(task.observers).toBeUndefined();
    expect(task.preferences).toEqual({});
    expect(task.progress).toBeUndefined();
    expect(task.report_count).toBeUndefined();
    expect(task.result_count).toBeUndefined();
    expect(task.schedule_periods).toBeUndefined();
    expect(task.schedule).toBeUndefined();
    expect(task.scanner).toBeUndefined();
    expect(task.slave).toBeUndefined();
    expect(task.status).toEqual(TASK_STATUS.unknown);
    expect(task.target).toBeUndefined();
    expect(task.trend).toBeUndefined();
    expect(task.usageType).toEqual(USAGE_TYPE.scan);
  });

  test('should parse empty element', () => {
    const task = Task.fromElement();
    expect(task.alerts).toEqual([]);
    expect(task.alterable).toBeUndefined();
    expect(task.apply_overrides).toBeUndefined();
    expect(task.auto_delete).toBeUndefined();
    expect(task.auto_delete_data).toBeUndefined();
    expect(task.average_duration).toBeUndefined();
    expect(task.config).toBeUndefined();
    expect(task.current_report).toBeUndefined();
    expect(task.hosts_ordering).toBeUndefined();
    expect(task.in_assets).toBeUndefined();
    expect(task.last_report).toBeUndefined();
    expect(task.max_checks).toBeUndefined();
    expect(task.max_hosts).toBeUndefined();
    expect(task.min_qod).toBeUndefined();
    expect(task.observers).toBeUndefined();
    expect(task.preferences).toEqual({});
    expect(task.progress).toBeUndefined();
    expect(task.report_count).toBeUndefined();
    expect(task.result_count).toBeUndefined();
    expect(task.schedule_periods).toBeUndefined();
    expect(task.schedule).toBeUndefined();
    expect(task.scanner).toBeUndefined();
    expect(task.slave).toBeUndefined();
    expect(task.status).toEqual(TASK_STATUS.unknown);
    expect(task.target).toBeUndefined();
    expect(task.trend).toBeUndefined();
    expect(task.usageType).toEqual(USAGE_TYPE.scan);
  });

  test('should parse hosts ordering', () => {
    // @ts-expect-error
    const task = Task.fromElement({hosts_ordering: 'foo'});
    expect(task.hosts_ordering).toBeUndefined();

    const task2 = Task.fromElement({hosts_ordering: HOSTS_ORDERING_RANDOM});
    expect(task2.hosts_ordering).toEqual(HOSTS_ORDERING_RANDOM);

    const task3 = Task.fromElement({hosts_ordering: HOSTS_ORDERING_REVERSE});
    expect(task3.hosts_ordering).toEqual(HOSTS_ORDERING_REVERSE);

    const task4 = Task.fromElement({hosts_ordering: HOSTS_ORDERING_SEQUENTIAL});
    expect(task4.hosts_ordering).toEqual(HOSTS_ORDERING_SEQUENTIAL);
  });

  test('should parse last report', () => {
    const task = Task.fromElement({
      _id: 't1',
      last_report: {
        report: {
          _id: 'r1',
        },
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.last_report?.id).toEqual('r1');
    expect(task.last_report?.entityType).toEqual('report');
  });

  test('should parse current report', () => {
    const task = Task.fromElement({
      _id: 't1',
      current_report: {
        report: {
          _id: 'r1',
        },
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.current_report?.id).toEqual('r1');
    expect(task.current_report?.entityType).toEqual('report');
  });

  test('should parse config', () => {
    const task = Task.fromElement({
      _id: 't1',
      config: {
        _id: 'c1',
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.config?.id).toEqual('c1');
    expect(task.config?.entityType).toEqual('scanconfig');
  });

  test('should parse slave', () => {
    const task = Task.fromElement({
      _id: 't1',
      slave: {
        _id: 's1',
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.slave?.id).toEqual('s1');
  });

  test('should parse target', () => {
    const task = Task.fromElement({
      _id: 't1',
      target: {
        _id: 't1',
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.target?.id).toEqual('t1');
    expect(task.target?.entityType).toEqual('target');
  });

  test('should parse alerts', () => {
    const task = Task.fromElement({
      _id: 't1',
      alert: [
        {
          _id: 'a1',
        },
        {
          _id: 'a2',
        },
      ],
    });
    expect(task.id).toEqual('t1');
    expect(task.alerts[0].id).toEqual('a1');
    expect(task.alerts[0].entityType).toEqual('alert');
    expect(task.alerts[1].id).toEqual('a2');
    expect(task.alerts[1].entityType).toEqual('alert');
  });

  test('should parse scanner', () => {
    const task = Task.fromElement({
      _id: 't1',
      scanner: {
        _id: 's1',
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.scanner?.id).toEqual('s1');
    expect(task.scanner?.entityType).toEqual('scanner');
  });

  test('should parse schedule', () => {
    const task = Task.fromElement({
      _id: 't1',
      schedule: {
        _id: 's1',
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.schedule?.id).toEqual('s1');
    expect(task.schedule?.entityType).toEqual('schedule');
  });

  test('should parse report counts', () => {
    const task = Task.fromElement({
      _id: 't1',
      report_count: {
        __text: 13,
        finished: 14,
      },
    });
    expect(task.id).toEqual('t1');
    expect(task.report_count?.total).toEqual(13);
    expect(task.report_count?.finished).toEqual(14);
  });

  test('should parse result counts', () => {
    const task = Task.fromElement({
      _id: 't1',
      result_count: 666,
    });
    expect(task.id).toEqual('t1');
    expect(task.result_count).toEqual(666);
  });

  test('should parse schedule periods', () => {
    const task = Task.fromElement({
      _id: 't1',
      schedule_periods: 666,
    });
    expect(task.id).toEqual('t1');
    expect(task.schedule_periods).toEqual(666);
  });

  test('should parse progress', () => {
    const task = Task.fromElement({
      _id: 't1',
      progress: {},
    });
    expect(task.progress).toEqual(0);

    const task2 = Task.fromElement({
      _id: 't1',
      progress: {
        __text: 66,
      },
    });
    expect(task2.progress).toEqual(66);

    const task3 = Task.fromElement({
      _id: 't1',
      progress: 66,
    });
    expect(task3.progress).toEqual(66);
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
            scanner_name: 'foo',
            value: 'bar',
            name: 'lorem',
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
    expect(task1.preferences).toEqual({foo: {value: 'bar', name: 'lorem'}});

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
    expect(task2.in_assets).toEqual(0);
    expect(task2.apply_overrides).toEqual(0);
    expect(task2.auto_delete).toEqual('no');
    expect(task2.auto_delete_data).toEqual(3);
  });

  test('should parse observers', () => {
    const task = Task.fromElement({
      observers: 'foo bar',
    });
    expect(task.observers?.user).toEqual(['foo', 'bar']);

    const task2 = Task.fromElement({
      observers: {
        __text: 'anon nymous',
        role: ['lorem'],
        group: ['ipsum', 'dolor'],
      },
    });

    expect(task2.observers?.user).toEqual(['anon', 'nymous']);
    expect(task2.observers?.role).toEqual(['lorem']);
    expect(task2.observers?.group).toEqual(['ipsum', 'dolor']);

    const task3 = Task.fromElement({
      observers: '',
    });
    expect(task3.observers?.user).toBeUndefined();
    expect(task3.observers?.role).toBeUndefined();
    expect(task3.observers?.group).toBeUndefined();

    const task4 = Task.fromElement({
      observers: {
        __text: '',
      },
    });
    expect(task4.observers?.user).toBeUndefined();
    expect(task4.observers?.role).toBeUndefined();
    expect(task4.observers?.group).toBeUndefined();
  });

  test('should parse alterable', () => {
    const task = Task.fromElement({
      _id: 't1',
      alterable: 1,
    });
    expect(task.id).toEqual('t1');
    expect(task.alterable).toEqual(1);

    const task2 = Task.fromElement({
      _id: 't2',
      alterable: 0,
    });
    expect(task2.id).toEqual('t2');
    expect(task2.alterable).toEqual(0);
  });

  test('should parse average duration', () => {
    const task = Task.fromElement({
      _id: 't1',
      average_duration: 123456,
    });
    expect(task.id).toEqual('t1');
    expect(task.average_duration).toEqual(parseDuration(123456));
  });

  test('should parse status', () => {
    const task = Task.fromElement({
      _id: 't1',
      status: TASK_STATUS.running,
    });
    expect(task.id).toEqual('t1');
    expect(task.status).toEqual(TASK_STATUS.running);
  });

  test('should parse trend', () => {
    const task = Task.fromElement({
      _id: 't1',
      trend: 'up',
    });
    expect(task.id).toEqual('t1');
    expect(task.trend).toEqual('up');

    const task2 = Task.fromElement({
      _id: 't2',
      trend: 'down',
    });
    expect(task2.id).toEqual('t2');
    expect(task2.trend).toEqual('down');
  });

  test('should throw error for invalid usage type', () => {
    expect(() => {
      Task.fromElement({
        _id: 't1',
        usage_type: 'invalid',
      });
    }).toThrow("Task.parseElement: usage_type must be 'scan'");
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
      [TASK_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status: status as TaskStatus});
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
      [TASK_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status: status as TaskStatus});
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
      [TASK_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status: status as TaskStatus});
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
      [TASK_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status: status as TaskStatus});
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
      [TASK_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = new Task({status: status as TaskStatus});
      expect(task.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let task = new Task({status: TASK_STATUS.new, alterable: 0});
    expect(task.isChangeable()).toEqual(true);

    task = new Task({status: TASK_STATUS.done, alterable: 1});
    expect(task.isChangeable()).toEqual(true);
  });
});
