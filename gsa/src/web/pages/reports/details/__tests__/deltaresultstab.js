/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';

import Report from 'gmp/models/report';
import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import DeltaResultsTab from '../deltaresultstab';

setLocale('en');

// Mock Delta Report Content

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
    type: 'nvt',
    name: 'nvt1',
    cve: 'CVE-2019-1234',
    tags: 'solution_type=Mitigation',
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
    hosts: entity.report.hosts,
    ports: entity.report.ports,
    cves: entity.report.cves,
    errors: entity.report.errors,
    task: entity.report.task,
  };
};

// Delta Results Tab Tests

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

const gmp = {
  settings: {},
};

describe('Delta Results Tab tests', () => {
  test('should render Delta Results Tab', () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();
    const onInteraction = jest.fn();
    const onSortChange = jest.fn();
    const onTargetEditClick = jest.fn();

    const {report, results, task} = getMockDeltaReport();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <DeltaResultsTab
        counts={results.counts}
        delta={true}
        filter={filter}
        hasTarget={true}
        isUpdating={false}
        progress={task.progress}
        results={results.entities}
        sortField={'severity'}
        sortReverse={true}
        status={report.scan_run_status}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Delta');
    expect(header[1]).toHaveTextContent('Vulnerability');
    expect(header[2]).toHaveTextContent('solution_type.svg');
    expect(header[3]).toHaveTextContent('Severity');
    expect(header[4]).toHaveTextContent('QoD');
    expect(header[5]).toHaveTextContent('Host');
    expect(header[6]).toHaveTextContent('Location');
    expect(header[7]).toHaveTextContent('Created');
    expect(header[8]).toHaveTextContent('IP');
    expect(header[9]).toHaveTextContent('Name');

    // Row 1
    expect(rows[2]).toHaveTextContent('[ = ]');
    expect(rows[2]).toHaveTextContent('Result 1');
    expect(rows[2]).toHaveTextContent('st_mitigate.svg');
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');
    expect(rows[2]).toHaveTextContent('80 %');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('80/tcp');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 2
    expect(rows[3]).toHaveTextContent('[ = ]');
    expect(rows[3]).toHaveTextContent('Result 2');
    expect(rows[3]).toHaveTextContent('st_vendorfix.svg');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');
    expect(rows[3]).toHaveTextContent('70 %');
    expect(rows[3]).toHaveTextContent('109.876.54.321');
    expect(rows[3]).toHaveTextContent('80/tcp');
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });

  // TODO
  // should render Empty Report
  // should render Empty Results Report
  // should call click handler
});
