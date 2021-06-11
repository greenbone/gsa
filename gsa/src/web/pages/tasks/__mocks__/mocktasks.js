/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import {SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import Task, {HYPERION_TASK_STATUS, TASK_TREND} from 'gmp/models/task';

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

const greenboneSensor = deepFreeze({
  id: '242526',
  name: 'scanner 2',
  type: 'GREENBONE_SENSOR_SCANNER_TYPE',
});

// ScanConfig
const scanConfig = deepFreeze({
  id: '314',
  name: 'foo',
  trash: false,
  type: SCAN_CONFIG_TYPE.openvas,
});

export const detailsScanConfig = deepFreeze({
  id: '314',
  name: 'Half empty and slow',
  creationTime: null,
  comment: "Most NVT's",
  families: [
    {name: 'family1', growing: true, maxNvtCount: 10, nvtCount: 7},
    {name: 'family2', growing: false, maxNvtCount: 5, nvtCount: 0},
  ],
  familyCount: 1,
  familyGrowing: true,
  nvtGrowing: false,
  owner: 'admin',
  inUse: false,
  knownNvtCount: 99998,
  maxNvtCount: 99999,
  modificationTime: '2020-09-29T12:16:50+00:00',
  nvtCount: 99998,
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  permissions: [{name: 'Everything'}],
  predefined: true,
  nvtPreferences: [
    {
      alternativeValues: ['postgres', 'regress'],
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'regress',
      nvt: {
        id: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  scannerPreferences: [
    {
      alternativeValues: ['foo', 'bar'],
      default: '1',
      hrName: 'scanner_pref',
      id: null,
      name: 'scanner_pref',
      type: null,
      value: '1',
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
  trash: false,
  type: SCAN_CONFIG_TYPE.openvas,
  usageType: 'scan',
  userTags: null,
  writable: false,
});

// Schedule
const schedule = deepFreeze({
  id: 'foo',
  name: 'schedule 1',
});

// Alert
const alert = deepFreeze({id: '151617', name: 'alert 1'});

// Reports
const lastReport = deepFreeze({
  id: '1234',
  severity: '5.0',
  creationTime: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
});

const currentReport = deepFreeze({
  id: '5678',
  creationTime: '2019-08-30T13:23:30Z',
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
const preferences = deepFreeze({
  createAssets: true,
  createAssetsApplyOverrides: true,
  createAssetsMinQod: 70,
  autoDeleteReports: null,
  maxConcurrentNvts: 4,
  maxConcurrentHosts: 20,
});

// Tasks
const task = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: true,
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  status: HYPERION_TASK_STATUS.stopped,
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
  scanner: greenboneSensor,
  scanConfig: scanConfig,
  preferences: preferences,
  observers: observers,
});

const newTask = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: 'admin',
  alterable: false,
  status: HYPERION_TASK_STATUS.new,
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
  status: HYPERION_TASK_STATUS.done,
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
  alterable: false,
  inUse: true,
  status: HYPERION_TASK_STATUS.running,
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
  alterable: false,
  status: HYPERION_TASK_STATUS.stopped,
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
  alterable: false,
  status: HYPERION_TASK_STATUS.done,
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
  alterable: false,
  status: HYPERION_TASK_STATUS.done,
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
  status: HYPERION_TASK_STATUS.done,
  target,
  trend: TASK_TREND.up,
  alterable: false,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule: null,
  alerts: [],
  scanConfig,
  scanner,
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
  status: HYPERION_TASK_STATUS.stopped,
  target,
  alterable: false,
  trend: null,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule,
  alerts: [alert],
  scanConfig,
  scanner,
  schedulePeriods: null,
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
