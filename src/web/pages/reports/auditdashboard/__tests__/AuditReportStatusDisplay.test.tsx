/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  ReportComplianceDisplay,
  ReportComplianceTableDisplay,
} from 'web/pages/reports/auditdashboard/AuditReportStatusDisplay';

const loaderData = {
  groups: [
    {value: 'yes', count: 2},
    {value: 'no', count: 3},
    {value: 'incomplete', count: 5},
  ],
};

vi.mock('web/components/dashboard/display/status/StatusDisplay', () => ({
  default: ({data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-status-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-point-${index}`}>
            {row.label}|{row.value}|{row.filterValue}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(transformedData)?.[index]?.join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

const createGmp = () => ({
  auditreports: {
    getComplianceAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=audit_report', counts: {}},
    }),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(), store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('ReportComplianceDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ReportComplianceDisplay).toBeDefined();
    expect(typeof ReportComplianceDisplay).toBe('function');
    expect(ReportComplianceDisplay.displayId).toBe('report-by-compliance');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ReportComplianceDisplay.displayId);

    expect(registered?.component).toBe(ReportComplianceDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Audit Reports by Compliance',
    );
  });

  test('should render the loaded compliance data', async () => {
    renderDisplay(<ReportComplianceDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Audit Reports by Compliance (Total: 10)',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent('Yes|2|yes');
      expect(screen.getByTestId('data-point-1')).toHaveTextContent('No|3|no');
      expect(screen.getByTestId('data-point-2')).toHaveTextContent(
        'Incomplete|5|incomplete',
      );
    });
  });
});

describe('ReportComplianceTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ReportComplianceTableDisplay).toBeDefined();
    expect(typeof ReportComplianceTableDisplay).toBe('function');
    expect(ReportComplianceTableDisplay.displayId).toBe(
      'report-by-compliance-table',
    );
    expect(ReportComplianceTableDisplay.displayName).toBe(
      'ReportComplianceTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ReportComplianceTableDisplay.displayId);

    expect(registered?.component).toBe(ReportComplianceTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Audit Reports by Compliance',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(<ReportComplianceTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Audit Reports by Compliance (Total: 10)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Status|# of Reports',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('Yes|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('No|3');
      expect(screen.getByTestId('data-row-2')).toHaveTextContent(
        'Incomplete|5',
      );
    });
  });
});
