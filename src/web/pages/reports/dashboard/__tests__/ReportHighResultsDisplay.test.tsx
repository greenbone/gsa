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
  ReportsHighResultsDisplay,
  ReportsHighResultsTableDisplay,
} from 'web/pages/reports/dashboard/ReportHighResultsDisplay';

const loaderData = {
  groups: [
    {
      value: '2026-01-01',
      stats: {
        high: {max: 5},
        high_per_host: {max: 2.5},
      },
    },
    {
      value: '2026-01-02',
      stats: {
        high: {max: 7},
        high_per_host: {max: 3.5},
      },
    },
  ],
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {typeof children === 'function'
          ? children({
              width: 400,
              height: 300,
              data: transformedData,
              state: {showLegend: true},
              svgRef: {current: null},
            })
          : children}
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

vi.mock('web/components/chart/LineChart', () => ({
  default: ({data, xAxisLabel, yAxisLabel, y2AxisLabel}) => (
    <div data-testid="mock-line-chart">
      <span data-testid="x-axis-label">{xAxisLabel}</span>
      <span data-testid="y-axis-label">{yAxisLabel}</span>
      <span data-testid="y2-axis-label">{y2AxisLabel}</span>
      {data.map((row, index) => (
        <span key={index} data-testid={`data-point-${index}`}>
          {row.label}|{row.y}|{row.y2}
        </span>
      ))}
    </div>
  ),
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=report', counts: {}},
    }),
  },
  reports: {
    getHighResultsAggregates: testing
      .fn()
      .mockResolvedValue({data: loaderData}),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp()});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('ReportsHighResultsDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ReportsHighResultsDisplay).toBeDefined();
    expect(typeof ReportsHighResultsDisplay).toBe('function');
    expect(ReportsHighResultsDisplay.displayId).toBe('report-by-high-results');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ReportsHighResultsDisplay.displayId);

    expect(registered?.component).toBe(ReportsHighResultsDisplay);
    expect(String(registered?.title)).toBe('Chart: Reports with high Results');
  });

  test('should render the loaded data and chart labels', async () => {
    renderDisplay(<ReportsHighResultsDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Reports with High Results',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent('Max High');
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Max High per Host',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent('|5|2.5');
      expect(screen.getByTestId('data-point-1')).toHaveTextContent('|7|3.5');
    });
  });
});

describe('ReportsHighResultsTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ReportsHighResultsTableDisplay).toBeDefined();
    expect(typeof ReportsHighResultsTableDisplay).toBe('function');
    expect(ReportsHighResultsTableDisplay.displayId).toBe(
      'report-by-high-results-table',
    );
    expect(ReportsHighResultsTableDisplay.displayName).toBe(
      'ReportsHighResultsTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ReportsHighResultsTableDisplay.displayId);

    expect(registered?.component).toBe(ReportsHighResultsTableDisplay);
    expect(String(registered?.title)).toBe('Table: Reports with high Results');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<ReportsHighResultsTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Reports with High Results',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Created Time|Max High|Max High per Host',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('|5|2.5');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('|7|3.5');
    });
  });
});
