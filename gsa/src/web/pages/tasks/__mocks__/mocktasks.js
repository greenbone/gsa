/* Copyright (C) 2020 Greenbone Networks GmbH
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
import {setLocale} from 'gmp/locale/lang';

import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';
import Task, {TASK_STATUS} from 'gmp/models/task';

import {deepFreeze} from 'web/utils/testing';

setLocale('en');

// Target
const target = deepFreeze({
  id: '159',
  name: 'target 1',
});

const target2 = deepFreeze({
  id: '265',
  name: 'target 2',
});

const target3 = deepFreeze({
  id: '358',
  name: 'target 3',
});

// Scanner
const scanner = deepFreeze({
  id: '212223',
  name: 'scanner 1',
  type: 'OPENVAS_SCANNER_TYPE',
});

const gmpScanner = deepFreeze({
  id: '242526',
  name: 'scanner 2',
  type: 'GMP_SCANNER_TYPE',
});

// ScanConfig
const scanConfig = deepFreeze({
  id: '314',
  name: 'foo',
  comment: 'bar',
  trash: false,
  scanner: scanner,
  type: OPENVAS_SCAN_CONFIG_TYPE,
});

// Schedule
const schedule = deepFreeze({
  id: 'c35f82f1-7798-4b84-b2c4-761a33068956',
  name: 'schedule 1',
});

// Alert
const alert = deepFreeze({id: '151617', name: 'alert 1'});

// Reports
const lastReport = deepFreeze({
  id: '1234',
  severity: '5.0',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
});

const currentReport = deepFreeze({
  id: '5678',
  timestamp: '2019-08-30T13:23:30Z',
  scanStart: '2019-08-30T13:23:34Z',
});

// Permissions
const limitedPermissions = deepFreeze([{name: 'get_tasks'}]);

const allPermissions = deepFreeze([
  {
    name: 'Everything',
  },
]);

// Observers
const observers = deepFreeze({
  users: ['john', 'jane'],
  roles: [
    {
      name: 'admin role',
    },
    {
      name: 'user role',
    },
  ],
  groups: [
    {
      name: 'group 1',
    },
    {
      name: 'group 2',
    },
  ],
});

// Preferences
const preferences = deepFreeze([
  {
    description: 'Add results to Asset Management',
    name: 'in_assets',
    value: 'yes',
  },
  {
    description: 'Apply Overrides when adding Assets',
    name: 'assets_apply_overrides',
    value: 'yes',
  },
  {
    description: 'Min QOD when adding Assets',
    name: 'assets_min_qod',
    value: '70',
  },
  {
    description: 'Auto Delete Reports',
    name: 'auto_delete',
    value: 'no',
  },
  {
    description: 'Auto Delete Reports Data',
    name: 'auto_delete_data',
    value: '5',
  },
  {
    description: 'Maximum concurrently executed NVTs per host',
    name: 'max_checks',
    value: '4',
  },
  {
    description: 'Maximum concurrently scanned hosts',
    name: 'max_hosts',
    value: '20',
  },
]);

// Tasks
const task = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 1,
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  status: TASK_STATUS.stopped,
  reports: {
    lastReport,
    currentReport,
    counts: {
      total: 2,
      finished: 1,
    },
  },
  permissions: allPermissions,
  target: target,
  schedule: schedule,
  alerts: [alert],
  scanner: gmpScanner,
  scanConfig: scanConfig,
  preferences: preferences,
  hostsOrdering: 'sequential',
  observers: observers,
});

const newTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.new,
  reports: {
    counts: {
      total: 0,
      finished: 0,
    },
  },
  results: {
    counts: {
      current: 0,
    },
  },
  permissions: allPermissions,
  target: target2,
});

const finishedTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  status: TASK_STATUS.done,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 0,
    },
  },
  permissions: allPermissions,
  target,
});

const runningTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  inUse: true,
  status: TASK_STATUS.running,
  reports: {
    lastReport,
    currentReport,
    counts: {
      total: 2,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 0,
    },
  },
  permissions: allPermissions,
  target: target3,
});

const stoppedTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.stopped,
  reports: {
    lastReport,
    currentReport,
    counts: {
      total: 2,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 10,
    },
  },
  permissions: allPermissions,
  target: target,
});

const observedTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.done,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 1,
    },
  },
  permissions: limitedPermissions,
  target: target,
});

const containerTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.done,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 1,
    },
  },
  permissions: allPermissions,
});

const listMockTask = deepFreeze({
  name: 'foo',
  id: '12345',
  permissions: allPermissions,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  status: TASK_STATUS.done,
  target,
  trend: 'up',
  alterable: 0,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule: null,
  alerts: [],
  scanConfig,
  scanner,
  hostsOrdering: null,
  observers,
});

const detailsMockTask = deepFreeze({
  name: 'foo',
  id: '12345',
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  permissions: allPermissions,
  reports: {
    lastReport,
    currentReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  status: TASK_STATUS.stopped,
  target,
  alterable: 0,
  trend: null,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule,
  alerts: [alert],
  scanConfig,
  scanner,
  schedulePeriods: null,
  hostsOrdering: 'sequential',
  userTags: null,
  observers,
});

export const getMockTasks = () => {
  return {
    task: Task.fromObject(task),
    newTask: Task.fromObject(newTask),
    finishedTask: Task.fromObject(finishedTask),
    runningTask: Task.fromObject(runningTask),
    stoppedTask: Task.fromObject(stoppedTask),
    observedTask: Task.fromObject(observedTask),
    containerTask: Task.fromObject(containerTask),
    listMockTask: Task.fromObject(listMockTask),
    detailsMockTask: Task.fromObject(detailsMockTask),
  };
};

// get mock data for creating mock requests
export const getMockTaskData = () => {
  return {
    listMockTask,
    detailsMockTask,
  };
};
