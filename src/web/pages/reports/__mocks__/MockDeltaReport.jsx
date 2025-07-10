/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {setLocale} from 'gmp/locale/lang';
import Report from 'gmp/models/report';
import {host1, host2} from 'web/pages/reports/__mocks__/MockReport';

setLocale('en');

// Task
const task1 = {
  _id: '314',
  name: 'foo',
  comment: 'bar',
  target: {_id: '159'},
  progress: 0,
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
    type: 'nvt',
    name: 'nvt1',
    cve: 'CVE-2019-1234',
    tags: 'solution_type=Mitigation',
    solution: {
      _type: 'Mitigation',
    },
  },
  threat: 'High',
  severity: 10.0,
  qod: {value: 80},
  delta: 'same',
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
    type: 'nvt',
    name: 'nvt2',
    cve: 'CVE-2019-5678',
    tags: 'solution_type=VendorFix',
    solution: {
      _type: 'VendorFix',
    },
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 70},
  delta: 'same',
};

export const getMockDeltaReport = () => {
  const report = {
    _type: 'delta',
    _id: '1234',
    delta: {
      report: {
        _id: '5678',
        scan_run_status: 'Done',
        scan_start: '2019-05-20T12:00:15Z',
        scan_end: '2019-05-20T12:30:46Z',
      },
    },
    scan_run_status: 'Done',
    scan_start: '2019-06-03T11:00:22Z',
    scan_end: '2019-06-03T11:31:23Z',
    timestamp: '2019-06-03T11:00:22Z',
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
    task: task1,
    closed_cves: {count: 0},
    vulns: {count: 0},
    apps: {count: 2},
    os: {count: 2},
    ssl_certs: {count: 2},
    result_count: {__text: 2, full: 2, filtered: 2},
    results: {result: [result1, result2]},
    hosts: {count: 2},
    host: [host1, host2],
  };

  const entity = Report.fromElement({
    report: report,
    creation_time: '2019-06-03T11:00:22Z',
    modification_time: '2019-06-03T11:00:22Z',
    name: '2019-06-03T11:00:22Z',
    owner: {name: 'admin'},
    _id: '91011',
  });

  return {
    entity,
    report: entity.report,
    results: entity.report.results,
    task: entity.report.task,
  };
};
