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

import Report from 'gmp/models/report';

setLocale('en');

// Task
const task1 = {
  _id: '314',
  name: 'foo',
  comment: 'bar',
  target: {_id: '159'},
};

// Results
const result1 = {
  _id: '101',
  name: 'Result 1',
  owner: {name: 'admin'},
  comment: 'Comment 1',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '123.456.78.910'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
  },
  threat: 'High',
  severity: 10.0,
  qod: {value: 80},
  detection: {
    result: {
      details: {
        detail: [{name: 'product', value: 'cpe:/a: 123'}],
      },
    },
  },
};

const result2 = {
  _id: '102',
  name: 'Result 2',
  owner: {name: 'admin'},
  comment: 'Comment 2',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '202',
    type: 'nvt',
    name: 'nvt2',
    tags: 'solution_type=VendorFix',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-5678'}]},
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 70},
  detection: {
    result: {
      details: {
        detail: [{name: 'product', value: 'cpe:/a: 456'}],
      },
    },
  },
};

const result3 = {
  _id: '103',
  name: 'Result 3',
  owner: {name: 'admin'},
  comment: 'Comment 3',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
    solution: {
      _type: 'Mitigation',
    },
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
};

// Hosts
export const host1 = {
  ip: '123.456.78.910',
  asset: {_asset_id: '123'},
  start: '2019-06-03T11:00:22Z',
  end: '2019-06-03T11:15:14Z',
  port_count: {page: 10},
  result_count: {
    page: 50,
    hole: {page: 14},
    warning: {page: 30},
    info: {page: 5},
    log: {page: 0},
    false_positive: {page: 1},
  },
  detail: [
    {name: 'best_os_cpe', value: 'cpe:/foo/bar'},
    {name: 'best_os_txt', value: 'Foo OS'},
    {name: 'App', value: 'cpe:/a: 123'},
    {name: 'App', value: 'cpe:/a: 789'},
    {name: 'App', value: 'cpe:/a: 101'},
    {name: 'cpe:/a: 123', value: 'ab'},
    {name: 'cpe:/a: 123', value: 'cd'},
    {name: 'traceroute', value: '1.1.1.1,2.2.2.2,3.3.3.3'},
    {name: 'hostname', value: 'foo.bar'},
    {name: 'Auth-SSH-Success'},
    {name: 'SSLInfo', value: '1234::123456'},
    {
      name: 'SSLDetails:123456',
      value:
        'issuer:CN=foo|serial:abcd|notBefore:20190130T201714|notAfter:20190801T201714',
    },
    {
      name: 'Closed CVE',
      value: 'CVE-2000-1234',
      source: {
        type: 'openvas',
        name: '201',
        description: 'This is a description',
      },
      extra: '10.0',
    },
  ],
};

export const host2 = {
  ip: '109.876.54.321',
  start: '2019-06-03T11:15:14Z',
  end: '2019-06-03T11:31:23Z',
  port_count: {page: 15},
  result_count: {
    page: 40,
    hole: {page: 5},
    warning: {page: 30},
    info: {page: 0},
    log: {page: 5},
    false_positive: {page: 0},
  },
  detail: [
    {name: 'best_os_cpe', value: 'cpe:/lorem/ipsum'},
    {name: 'best_os_txt', value: 'Lorem OS'},
    {name: 'App', value: 'cpe:/a: 123'},
    {name: 'App', value: 'cpe:/a: 456'},
    {name: 'traceroute', value: '1.1.1.1,2.2.2.2'},
    {name: 'hostname', value: 'lorem.ipsum'},
    {name: 'Auth-SSH-Failure'},
    {name: 'SSLInfo', value: '5678::654321'},
    {
      name: 'SSLDetails:654321',
      value:
        'issuer:CN=bar|serial:dcba|notBefore:20190330T201714|notAfter:20191001T201714',
    },
    {
      name: 'Closed CVE',
      value: 'CVE-2000-5678',
      source: {
        type: 'openvas',
        name: '202',
        description: 'This is another description',
      },
      extra: '5.0',
    },
  ],
};

// Ports
const port1 = {
  host: '1.1.1.1',
  __text: '123/tcp',
  severity: 10.0,
  threat: 'High',
};
const port2 = {
  host: '2.2.2.2',
  __text: '456/tcp',
  severity: 5.0,
  threat: 'Medium',
};

// Errors
const error1 = {
  host: {
    __text: '123.456.78.910',
    asset: {_asset_id: '123'},
  },
  port: '123/tcp',
  description: 'This is an error.',
  nvt: {
    _oid: '314',
    name: 'NVT1',
  },
};

const error2 = {
  host: {
    __text: '109.876.54.321',
    asset: {_asset_id: '109'},
  },
  port: '456/tcp',
  description: 'This is another error.',
  nvt: {
    _oid: '159',
    name: 'NVT2',
  },
};

export const getMockReport = () => {
  const report = {
    _id: '1234',
    scan_run_status: 'Done',
    scan_start: '2019-06-03T11:00:22Z',
    scan_end: '2019-06-03T11:31:23Z',
    timestamp: '2019-06-03T11:00:22Z',
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
    task: task1,
    closed_cves: {count: 0},
    vulns: {count: 0},
    apps: {count: 4},
    os: {count: 2},
    ssl_certs: {count: 2},
    result_count: {
      __text: 24,
      full: 24,
      filtered: 24,
      hole: {filtered: 3},
      info: {filtered: 10},
      warning: {filtered: 5},
      log: {filtered: 2},
      false_positive: {filtered: 4},
    },
    results: {result: [result1, result2, result3]},
    hosts: {count: 2},
    host: [host1, host2],
    ports: {
      count: 2,
      port: [port1, port2],
    },
    errors: {
      count: 2,
      error: [error1, error2],
    },
    severity: {
      full: 10.0,
      filtered: 10.0,
    },
  };

  const entity = Report.fromElement({
    report: report,
    creation_time: '2019-06-02T12:00:22Z',
    modification_time: '2019-06-03T11:00:22Z',
    name: '2019-06-03T11:00:22Z',
    owner: {name: 'admin'},
    task: task1,
    _id: '1234',
  });

  return {
    entity,
    report: entity.report,
    results: entity.report.results,
    hosts: entity.report.hosts,
    ports: entity.report.ports,
    applications: entity.report.applications,
    operatingsystems: entity.report.operatingsystems,
    cves: entity.report.cves,
    closedCves: entity.report.closedCves,
    tlsCertificates: entity.report.tlsCertificates,
    errors: entity.report.errors,
    task: entity.report.task,
  };
};
