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

setLocale('en');

// Target
const target = {
  id: '159',
  name: 'target 1',
};

const target2 = {
  id: '265',
  name: 'target 2',
};

const target3 = {
  id: '358',
  name: 'target 3',
};

// Scanner
const scanner = {
  id: '212223',
  name: 'scanner 1',
  type: 'OPENVAS_SCANNER_TYPE',
};

const gmpScanner = {
  id: '242526',
  name: 'scanner 2',
  type: 'GMP_SCANNER_TYPE',
};

// ScanConfig
const scanConfig = {
  id: '314',
  name: 'foo',
  comment: 'bar',
  trash: false,
  scanner: scanner,
  type: OPENVAS_SCAN_CONFIG_TYPE,
};

// Schedule
const schedule = {id: '121314', name: 'schedule 1'};

// Alert
const alert = {id: '151617', name: 'alert 1'};

// Reports
const lastReport = {
  id: '1234',
  severity: '5.0',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
};

const currentReport = {
  id: '5678',
  timestamp: '2019-08-30T13:23:30Z',
  scanStart: '2019-08-30T13:23:34Z',
};

// Permissions
const limitedPermissions = [{name: 'get_tasks'}];

const allPermissions = [
  {
    name: 'Everything',
  },
];

// Observers
const observers = {
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
};

// Preferences
const preferences = [
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
];

// Tasks
const task = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 1,
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  status: TASK_STATUS.stopped,
  lastReport: lastReport,
  currentReport: currentReport,
  reportCount: {
    total: 2,
    finished: 1,
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
};

const newTask = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.new,
  reportCount: {
    total: 0,
    finished: 0,
  },
  permissions: allPermissions,
  target: target2,
};

const finishedTask = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  status: TASK_STATUS.done,
  lastReport,
  reportCount: {
    total: 1,
    finished: 1,
  },
  permissions: allPermissions,
  target,
};

const runningTask = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  inUse: true,
  status: TASK_STATUS.running,
  lastReport: lastReport,
  currentReport: currentReport,
  reportCount: {
    total: 2,
    finished: 1,
  },
  permissions: allPermissions,
  target: target3,
};

const stoppedTask = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.stopped,
  lastReport: lastReport,
  currentReport: currentReport,
  reportCount: {
    total: 2,
    finished: 1,
  },
  permissions: allPermissions,
  target: target,
};

const observedTask = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.done,
  lastReport: lastReport,
  reportCount: {
    total: 1,
    finished: 1,
  },
  permissions: limitedPermissions,
  target: target,
};

const containerTask = {
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: 0,
  status: TASK_STATUS.done,
  lastReport: lastReport,
  reportCount: {
    total: 1,
    finished: 1,
  },
  permissions: allPermissions,
};

const listMockTask = {
  name: 'foo',
  id: '12345',
  permissions: allPermissions,
  lastReport,
  reportCount: {
    total: 1,
    finished: 1,
  },
  status: TASK_STATUS.done,
  target,
  trend: 'up',
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule: null,
  alerts: [],
  scanConfig,
  scanner,
  hostsOrdering: null,
  observers,
};

const detailsMockTask = {
  name: 'foo',
  id: '12345',
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  permissions: allPermissions,
  lastReport,
  currentReport,
  reportCount: {
    total: 1,
    finished: 1,
  },
  status: TASK_STATUS.stopped,
  target,
  trend: null,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule: schedule,
  alerts: [alert],
  scanConfig,
  scanner,
  schedulePeriods: null,
  hostsOrdering: 'sequential',
  userTags: null,
  observers,
};

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
