/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect} from '@gsa/testing';
import {rendererWithTableBody, screen} from 'web/testing';
import type Filter from 'gmp/models/filter';
import type ReportReport from 'gmp/models/report/report';
import {TASK_STATUS} from 'gmp/models/task';
import Summary from 'web/pages/reports/details/Summary';

const createFilter = (value: string): Filter =>
  ({
    simple: () => ({
      toFilterString: () => value,
    }),
  }) as unknown as Filter;

const createBaseReport = (): ReportReport =>
  ({
    id: 'report-1',
    scan_run_status: TASK_STATUS.running,
    hosts: {
      counts: {all: 3},
    },
    task: {
      id: 'task-1',
      name: 'Example Task',
      comment: 'Example comment',
      progress: 42,
      isImport: () => false,
    },
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
  }) as unknown as ReportReport;

describe('Summary', () => {
  test('renders basic task info, comment, hosts, filter and timezone', () => {
    const report = createBaseReport();
    const filter = createFilter('severity>5');
    const {render} = rendererWithTableBody({capabilities: true});

    render(
      <Summary
        filter={filter}
        report={report}
        reportId={report.id as string}
      />,
    );

    const taskLink = screen.getAllByTestId('details-link')[0];
    expect(taskLink).toHaveAttribute('href', '/task/task-1');
    expect(taskLink).toHaveTextContent('Example Task');

    expect(screen.getByText('Example comment')).toBeInTheDocument();

    expect(screen.getByText('Hosts scanned')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('severity>5')).toBeInTheDocument();

    expect(screen.getByText('Timezone')).toBeInTheDocument();
    expect(screen.getByText('UTC (UTC)')).toBeInTheDocument();
  });

  test('uses import status when task is an import task', () => {
    const report = {
      ...createBaseReport(),
      task: {
        id: 'task-2',
        name: 'Import Task',
        comment: 'Import comment',
        progress: 10,
        isImport: () => true,
      },
    } as unknown as ReportReport;

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Summary
        filter={createFilter('')}
        report={report}
        reportId={report.id as string}
      />,
    );

    const statusText = screen.getByTestId('statusbar-text');
    expect(statusText).toBeInTheDocument();
  });

  test('renders delta report sections when isDeltaReport is true', () => {
    const report = {
      ...createBaseReport(),
      scan_start: 'scan-start-1',
      delta_report: {
        id: 'report-2',
        scan_run_status: TASK_STATUS.done,
      },
      isDeltaReport: () => true,
    } as unknown as ReportReport;

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Summary
        filter={createFilter('')}
        report={report}
        reportId={report.id as string}
      />,
    );

    expect(screen.getByText('Report 1')).toBeInTheDocument();
    expect(screen.getByText('Report 2')).toBeInTheDocument();
    expect(screen.getByText('Scan Time Report 1')).toBeInTheDocument();
    expect(screen.getByText('Scan Status Report 1')).toBeInTheDocument();
    expect(screen.getByText('Scan Status Report 2')).toBeInTheDocument();

    const links = screen.getAllByTestId('details-link');
    const report1Link = links.find(link =>
      (link as HTMLAnchorElement).href.includes('/report/report-1'),
    ) as HTMLAnchorElement;
    const report2Link = links.find(link =>
      (link as HTMLAnchorElement).href.includes('/report/report-2'),
    ) as HTMLAnchorElement;

    expect(report1Link).toBeDefined();
    expect(report2Link).toBeDefined();
  });

  test('uses audit link types when audit prop is true', () => {
    const report = {
      ...createBaseReport(),
      delta_report: {
        id: 'audit-report-2',
        scan_run_status: TASK_STATUS.done,
      },
      isDeltaReport: () => true,
    } as unknown as ReportReport;

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Summary
        audit={true}
        filter={createFilter('')}
        report={report}
        reportId={report.id as string}
      />,
    );

    const links = screen.getAllByTestId('details-link');
    const taskLink = links[0] as HTMLAnchorElement;
    expect(taskLink).toHaveAttribute('href', '/audit/task-1');

    const reportLinks = links.filter(link =>
      (link as HTMLAnchorElement).href.includes('/auditreport/'),
    ) as HTMLAnchorElement[];
    expect(reportLinks.length).toBeGreaterThanOrEqual(1);
  });

  test('shows error panel when reportError prop is provided', () => {
    const report = createBaseReport();
    const {render} = rendererWithTableBody({capabilities: true});

    render(
      <Summary
        filter={createFilter('')}
        report={report}
        reportError={new Error('Load failed')}
        reportId={report.id as string}
      />,
    );

    expect(
      screen.getByText(/Error while loading Report report-1/),
    ).toBeInTheDocument();
  });
});
