/* Copyright (C) 2021 Greenbone Networks GmbH
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
import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

import {GET_REPORT} from '../reports';

// Task
const task = deepFreeze({
  id: '314',
  name: 'foo',
  comment: 'bar',
  progress: null,
  target: {id: '159', name: null},
});

// Hosts
export const host1 = {
  ip: '123.456.78.910',
  id: '123',
  start: '2019-06-03T11:00:22Z',
  end: '2019-06-03T11:15:14Z',
  ports: {counts: {current: 10}},
  results: {
    counts: {
      current: 50,
      high: 14,
      medium: 30,
      low: 5,
      log: 0,
      falsePositive: 1,
    },
  },
  details: [
    {name: 'best_os_cpe', value: 'cpe:/foo/bar', source: null, extra: null},
    {name: 'best_os_txt', value: 'Foo OS', source: null, extra: null},
    {name: 'App', value: 'cpe:/a: 123', source: null, extra: null},
    {name: 'App', value: 'cpe:/a: 789', source: null, extra: null},
    {name: 'App', value: 'cpe:/a: 101', source: null, extra: null},
    {name: 'cpe:/a: 123', value: 'ab', source: null, extra: null},
    {name: 'cpe:/a: 123', value: 'cd', source: null, extra: null},
    {
      name: 'traceroute',
      value: '1.1.1.1,2.2.2.2,3.3.3.3',
      source: null,
      extra: null,
    },
    {name: 'hostname', value: 'foo.bar', source: null, extra: null},
    {name: 'Auth-SSH-Success', value: null, source: null, extra: null},
    {name: 'SSLInfo', value: '1234::123456', source: null, extra: null},
    {
      name: 'SSLDetails:123456',
      value:
        'issuer:CN=foo|serial:abcd|notBefore:20190130T201714|notAfter:20190801T201714',
      source: null,
      extra: null,
    },
    {
      name: 'Closed CVE',
      value: 'CVE-2000-1234',
      source: {
        type: 'openvas',
        description: 'This is a description',
      },
      extra: '10.0',
    },
  ],
};

export const host2 = {
  ip: '109.876.54.321',
  id: null,
  start: '2019-06-03T11:15:14Z',
  end: '2019-06-03T11:31:23Z',
  ports: {counts: {current: 15}},
  results: {
    counts: {
      current: 40,
      high: 5,
      medium: 30,
      low: 0,
      log: 5,
      falsePositive: 0,
    },
  },
  details: [
    {name: 'best_os_cpe', value: 'cpe:/lorem/ipsum', source: null, extra: null},
    {name: 'best_os_txt', value: 'Lorem OS', source: null, extra: null},
    {name: 'App', value: 'cpe:/a: 123', source: null, extra: null},
    {name: 'App', value: 'cpe:/a: 456', source: null, extra: null},
    {name: 'traceroute', value: '1.1.1.1,2.2.2.2', source: null, extra: null},
    {name: 'hostname', value: 'lorem.ipsum', source: null, extra: null},
    {name: 'Auth-SSH-Failure', value: null, source: null, extra: null},
    {name: 'SSLInfo', value: '5678::654321', source: null, extra: null},
    {
      name: 'SSLDetails:654321',
      value:
        'issuer:CN=bar|serial:dcba|notBefore:20190330T201714|notAfter:20191001T201714',
      source: null,
      extra: null,
    },
    {
      name: 'Closed CVE',
      value: 'CVE-2000-5678',
      source: {
        type: 'openvas',
        description: 'This is another description',
      },
      extra: '5.0',
    },
  ],
};

// Ports
const port1 = deepFreeze({
  port: '123/tcp',
  host: '1.1.1.1',
  severity: 10.0,
  threat: 'High',
});
const port2 = deepFreeze({
  port: '456/tcp',
  host: '2.2.2.2',
  severity: 10.0,
  threat: 'Medium',
});

// Results
export const result1 = deepFreeze({
  id: '101',
  name: 'Result 1',
  comment: 'Comment 1',
  creationTime: '2019-06-03T11:06:31Z',
  modificationTime: '2019-06-03T11:06:31Z',
  host: {id: '123.456.78.910'},
  port: '80/tcp',
  nvt: {id: '1.2.3.4'},
  threat: 'High',
  severity: 10.0,
  qod: {value: 80, type: 'registry'},
});

export const result2 = deepFreeze({
  id: '102',
  name: 'Result 2',
  comment: 'Comment 2',
  creationTime: '2019-06-03T11:06:31Z',
  modificationTime: '2019-06-03T11:06:31Z',
  host: {id: '109.876.54.321'},
  port: '80/tcp',
  nvt: null,
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 70, type: 'registry'},
});

export const result3 = deepFreeze({
  id: '103',
  name: 'Result 3',
  comment: 'Comment 3',
  creationTime: '2019-06-03T11:06:31Z',
  modificationTime: '2019-06-03T11:06:31Z',
  host: {id: '109.876.54.321'},
  port: '80/tcp',
  nvt: null,
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80, type: 'registry'},
});

// Errors
const error1 = deepFreeze({
  host: {
    name: '123.456.78.910',
    id: '123',
  },
  port: '123/tcp',
  description: 'This is an error.',
  nvt: {
    id: '314',
    name: 'NVT1',
  },
  scanNvtVersion: null,
});

const error2 = deepFreeze({
  host: {
    name: '109.876.54.321',
    id: '109',
  },
  port: '456/tcp',
  description: 'This is another error.',
  nvt: {
    id: '159',
    name: 'NVT2',
  },
  scanNvtVersion: null,
});

// Report
export const report = deepFreeze({
  id: '1234',
  name: '2019-06-03T11:00:22Z',
  owner: 'admin',
  comment: '',
  creationTime: '2019-06-02T12:00:22Z',
  modificationTime: '2019-06-03T11:00:22Z',
  writable: false,
  inUse: false,
  task: task,
  scanRunStatus: 'Done',
  scanStart: '2019-06-03T11:00:22Z',
  scanEnd: '2019-06-03T11:31:23Z',
  hostsCount: {
    total: 2,
    filtered: 2,
    current: 2,
  },
  hosts: [host1, host2],
  portsCount: {
    total: 1,
    filtered: 1,
    current: 1,
  },
  ports: [port1, port2],
  resultsCount: {
    total: 24,
    filtered: 24,
    current: 24,
    high: {
      total: 3,
      filtered: 3,
      current: 3,
    },
    info: {
      total: 10,
      filtered: 10,
      current: 10,
    },
    log: {
      total: 2,
      filtered: 2,
      current: 2,
    },
    warning: {
      total: 5,
      filtered: 5,
      current: 5,
    },
    falsePositive: {
      total: 4,
      filtered: 4,
      current: 4,
    },
  },
  results: [result1, result2, result3],
  closedCves: {
    counts: {
      total: 0,
      filtered: 0,
      current: 0,
    },
  },
  operatingSystems: {
    counts: {
      total: 2,
      filtered: 2,
      current: 2,
    },
  },
  applications: {
    counts: {
      total: 4,
      filtered: 4,
      current: 4,
    },
  },
  tlsCertificates: {
    counts: {
      total: 2,
      filtered: 2,
      current: 2,
    },
  },
  vulnerabilities: {
    counts: {
      total: 0,
      filtered: 0,
      current: 0,
    },
  },
  severity: {
    total: 10.0,
    filtered: 10.0,
  },
  errors: {
    counts: {
      total: 2,
      filtered: 2,
      current: 2,
    },
    errors: [error1, error2],
  },
  userTags: null,
  timestamp: '2019-06-03T11:00:22Z',
  timezone: 'UTC',
  timezoneAbbrev: 'UTC',
});

export const createGetReportQueryMock = (id = '1234', result = report) =>
  createGenericQueryMock(GET_REPORT, {report: result}, {id});
