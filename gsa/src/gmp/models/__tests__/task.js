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

import Model from 'gmp/model';

import Task, {HYPERION_TASK_STATUS} from 'gmp/models/task';

import Report from '../report';
import Scanner from '../scanner';
import Schedule from '../schedule';

import {testModel} from '../testing';

describe('Task Model parse tests', () => {
  testModel(Task, 'task', {testIsActive: false});

  test('should parse lastReport', () => {
    const object = {
      id: 't1',
      reports: {
        lastReport: {
          id: 'r1',
        },
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.reports.lastReport).toBeInstanceOf(Report);
    expect(task.reports.lastReport.id).toEqual('r1');
    expect(task.reports.lastReport.entityType).toEqual('report');
  });

  test('should parse current_report', () => {
    const object = {
      id: 't1',
      reports: {
        currentReport: {
          id: 'r1',
        },
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.reports.currentReport).toBeInstanceOf(Report);
    expect(task.reports.currentReport.id).toEqual('r1');
    expect(task.reports.currentReport.entityType).toEqual('report');
  });

  test('should parse config', () => {
    const object = {
      id: 't1',
      scanConfig: {
        id: 'c1',
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.config).toBeInstanceOf(Model);
    expect(task.config.id).toEqual('c1');
    expect(task.config.entityType).toEqual('scanconfig');
  });

  test('should parse target', () => {
    const object = {
      id: 't1',
      target: {
        id: 't1',
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.target).toBeInstanceOf(Model);
    expect(task.target.id).toEqual('t1');
    expect(task.target.entityType).toEqual('target');
  });

  test('should parse alerts', () => {
    const object = {
      id: 't1',
      alerts: [
        {
          id: 'a1',
        },
        {
          id: 'a2',
        },
      ],
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.alerts[0]).toBeInstanceOf(Model);
    expect(task.alerts[0].id).toEqual('a1');
    expect(task.alerts[0].entityType).toEqual('alert');
    expect(task.alerts[1]).toBeInstanceOf(Model);
    expect(task.alerts[1].entityType).toEqual('alert');
    expect(task.alerts[1].id).toEqual('a2');
  });

  test('should parse scanner', () => {
    const object = {
      id: 't1',
      scanner: {
        id: 's1',
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.scanner).toBeInstanceOf(Scanner);
    expect(task.scanner.id).toEqual('s1');
    expect(task.scanner.entityType).toEqual('scanner');
  });

  test('should parse schedule', () => {
    const object = {
      id: 't1',
      schedule: {
        id: 's1',
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.schedule).toBeInstanceOf(Schedule);
    expect(task.schedule.id).toEqual('s1');
    expect(task.schedule.entityType).toEqual('schedule');
  });

  test('should parse report counts', () => {
    const object = {
      id: 't1',
      reports: {
        counts: {
          total: 13,
          finished: 14,
        },
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.reports.counts.total).toEqual(13);
    expect(task.reports.counts.finished).toEqual(14);
  });

  test('should parse result counts', () => {
    const object = {
      id: 't1',
      results: {
        counts: {
          current: 666,
        },
      },
    };

    const task = Task.fromObject(object);

    expect(task.id).toEqual('t1');

    expect(task.results.counts.current).toEqual(666);
  });

  test('should parse progress', () => {
    const task1 = Task.fromObject({
      id: 't1',
    });

    expect(task1.progress).toEqual(0);

    const task2 = Task.fromObject({
      id: 't1',
      progress: {},
    });
    expect(task2.progress).toEqual(0);

    const task3 = Task.fromObject({
      id: 't1',
      progress: {
        __text: '66',
      },
    });
    expect(task3.progress).toEqual(66);

    const task4 = Task.fromObject({
      id: 't1',
      progress: '66',
    });
    expect(task4.progress).toEqual(66);
  });

  test('should parse preferences', () => {
    const task1 = Task.fromObject({
      id: 't1',
      preferences: {
        createAssets: true,
        createAssetsApplyOverrides: true,
        createAssetsMinQod: 70,
        autoDeleteReports: 0,
        maxConcurrentHosts: 20,
        maxConcurrentNvts: 4,
      },
    });
    const task2 = Task.fromObject({
      id: 't1',
      preferences: {
        createAssets: false,
        createAssetsApplyOverrides: false,
        autoDeleteReports: 3,
      },
    });

    expect(task1.preferences.createAssets).toEqual(true);
    expect(task1.preferences.createAssetsApplyOverrides).toEqual(true);
    expect(task1.preferences.createAssetsMinQod).toEqual(70);
    expect(task1.preferences.maxConcurrentHosts).toEqual(20);
    expect(task1.preferences.maxConcurrentNvts).toEqual(4);
    expect(task1.preferences.autoDeleteReports).toBe(0);
    expect(task2.preferences.createAssets).toEqual(false);
    expect(task2.preferences.createAssetsApplyOverrides).toEqual(false);
    expect(task2.preferences.autoDeleteReports).toEqual(3);
  });
});

describe(`Task Model methods tests`, () => {
  test('should be a container if targetid is not set', () => {
    const task1 = Task.fromObject({});
    const task2 = Task.fromObject({target: {id: 'foo'}});

    expect(task1.isContainer()).toEqual(true);
    expect(task2.isContainer()).toEqual(false);
  });

  test('should use status for isActive', () => {
    const statusList = {
      [HYPERION_TASK_STATUS.running]: true,
      [HYPERION_TASK_STATUS.stoprequested]: true,
      [HYPERION_TASK_STATUS.deleterequested]: true,
      [HYPERION_TASK_STATUS.ultimatedeleterequested]: true,
      [HYPERION_TASK_STATUS.resumerequested]: true,
      [HYPERION_TASK_STATUS.requested]: true,
      [HYPERION_TASK_STATUS.stopped]: false,
      [HYPERION_TASK_STATUS.new]: false,
      [HYPERION_TASK_STATUS.interrupted]: false,
      [HYPERION_TASK_STATUS.container]: false,
      [HYPERION_TASK_STATUS.uploading]: false,
      [HYPERION_TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = Task.fromObject({status});
      expect(task.isActive()).toEqual(exp);
    }
  });

  test('should use status for isRunning', () => {
    const statusList = {
      [HYPERION_TASK_STATUS.running]: true,
      [HYPERION_TASK_STATUS.stoprequested]: false,
      [HYPERION_TASK_STATUS.deleterequested]: false,
      [HYPERION_TASK_STATUS.ultimatedeleterequested]: false,
      [HYPERION_TASK_STATUS.resumerequested]: false,
      [HYPERION_TASK_STATUS.requested]: false,
      [HYPERION_TASK_STATUS.stopped]: false,
      [HYPERION_TASK_STATUS.new]: false,
      [HYPERION_TASK_STATUS.interrupted]: false,
      [HYPERION_TASK_STATUS.container]: false,
      [HYPERION_TASK_STATUS.uploading]: false,
      [HYPERION_TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = Task.fromObject({status});
      expect(task.isRunning()).toEqual(exp);
    }
  });

  test('should use status for isStopped', () => {
    const statusList = {
      [HYPERION_TASK_STATUS.running]: false,
      [HYPERION_TASK_STATUS.stoprequested]: false,
      [HYPERION_TASK_STATUS.deleterequested]: false,
      [HYPERION_TASK_STATUS.ultimatedeleterequested]: false,
      [HYPERION_TASK_STATUS.resumerequested]: false,
      [HYPERION_TASK_STATUS.requested]: false,
      [HYPERION_TASK_STATUS.stopped]: true,
      [HYPERION_TASK_STATUS.new]: false,
      [HYPERION_TASK_STATUS.interrupted]: false,
      [HYPERION_TASK_STATUS.container]: false,
      [HYPERION_TASK_STATUS.uploading]: false,
      [HYPERION_TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = Task.fromObject({status});
      expect(task.isStopped()).toEqual(exp);
    }
  });

  test('should use status for isInterrupted', () => {
    const statusList = {
      [HYPERION_TASK_STATUS.running]: false,
      [HYPERION_TASK_STATUS.stoprequested]: false,
      [HYPERION_TASK_STATUS.deleterequested]: false,
      [HYPERION_TASK_STATUS.ultimatedeleterequested]: false,
      [HYPERION_TASK_STATUS.resumerequested]: false,
      [HYPERION_TASK_STATUS.requested]: false,
      [HYPERION_TASK_STATUS.stopped]: false,
      [HYPERION_TASK_STATUS.new]: false,
      [HYPERION_TASK_STATUS.interrupted]: true,
      [HYPERION_TASK_STATUS.container]: false,
      [HYPERION_TASK_STATUS.uploading]: false,
      [HYPERION_TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = Task.fromObject({status});
      expect(task.isInterrupted()).toEqual(exp);
    }
  });

  test('should use status for isNew', () => {
    const statusList = {
      [HYPERION_TASK_STATUS.running]: false,
      [HYPERION_TASK_STATUS.stoprequested]: false,
      [HYPERION_TASK_STATUS.deleterequested]: false,
      [HYPERION_TASK_STATUS.ultimatedeleterequested]: false,
      [HYPERION_TASK_STATUS.resumerequested]: false,
      [HYPERION_TASK_STATUS.requested]: false,
      [HYPERION_TASK_STATUS.stopped]: false,
      [HYPERION_TASK_STATUS.new]: true,
      [HYPERION_TASK_STATUS.interrupted]: false,
      [HYPERION_TASK_STATUS.container]: false,
      [HYPERION_TASK_STATUS.uploading]: false,
      [HYPERION_TASK_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const task = Task.fromObject({status});
      expect(task.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let task = Task.fromObject({
      status: HYPERION_TASK_STATUS.new,
      alterable: '0',
    });
    expect(task.isChangeable()).toEqual(true);

    task = Task.fromObject({status: HYPERION_TASK_STATUS.done, alterable: '1'});
    expect(task.isChangeable()).toEqual(true);
  });

  test('should parse all observers types', () => {
    const task = Task.fromObject({
      observers: {
        users: ['anon', 'nymous'],
        roles: [{name: 'lorem'}],
        groups: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const {observers} = task;

    expect(observers.users).toEqual(['anon', 'nymous']);
    expect(observers.roles).toEqual([{name: 'lorem'}]);
    expect(observers.groups).toEqual([{name: 'ipsum'}, {name: 'dolor'}]);
  });

  test('should parse userTags (graphQL)', () => {
    const task = Task.fromObject({
      userTags: {
        count: 2,
        tags: [
          {name: 'foo', id: 'bar', value: 'lorem', comment: 'ipsum'},
          {name: 'foo1', id: 'bar1', value: 'lorem1', comment: 'ipsum1'},
        ],
      },
    });

    const tags = task.userTags;
    expect(tags.length).toBe(2);

    expect(tags[0].name).toEqual('foo');
    expect(tags[0].id).toEqual('bar');
    expect(tags[0].value).toEqual('lorem');
    expect(tags[0].comment).toEqual('ipsum');

    expect(tags[1].name).toEqual('foo1');
    expect(tags[1].id).toEqual('bar1');
    expect(tags[1].value).toEqual('lorem1');
    expect(tags[1].comment).toEqual('ipsum1');
  });
});
