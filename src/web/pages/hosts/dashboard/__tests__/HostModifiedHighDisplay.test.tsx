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
  HostsModifiedHighDisplay,
  HostsModifiedHighTableDisplay,
} from 'web/pages/hosts/dashboard/HostModifiedHighDisplay';

const loaderData = {
  groups: [
    {
      value: '2026-01-01',
      count: '5',
      c_count: '10',
      subgroup: {value: 'High'},
    },
    {
      value: '2026-01-02',
      count: '7',
      c_count: '12',
      subgroup: {value: 'Medium'},
    },
    {
      value: '2026-01-03',
      count: '3',
      c_count: '8',
      subgroup: {value: 'High'},
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
        {transformedData.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(row).join('|')}
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
      meta: {filter: 'type=host', counts: {}},
    }),
  },
  hosts: {
    getModifiedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('HostsModifiedHighDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsModifiedHighDisplay).toBeDefined();
    expect(typeof HostsModifiedHighDisplay).toBe('function');
    expect(HostsModifiedHighDisplay.displayId).toBe(
      'host-by-high-modification-time',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsModifiedHighDisplay.displayId);

    expect(registered?.component).toBe(HostsModifiedHighDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Hosts (High) by Modification Time',
    );
  });

  test('should render only high severity hosts and the chart labels', async () => {
    renderDisplay(<HostsModifiedHighDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts (High) by Modification Time (Total: 8)',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of Modified Hosts (High)',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total Hosts (High)',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent('5|10');
      expect(screen.getByTestId('data-point-1')).toHaveTextContent('3|8');
      expect(screen.queryByText(/7\|12/)).toBeNull();
    });
  });
});

describe('HostsModifiedHighTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsModifiedHighTableDisplay).toBeDefined();
    expect(typeof HostsModifiedHighTableDisplay).toBe('function');
    expect(HostsModifiedHighTableDisplay.displayId).toBe(
      'host-by-high-modification-time-table',
    );
    expect(HostsModifiedHighTableDisplay.displayName).toBe(
      'HostsModifiedHighTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsModifiedHighTableDisplay.displayId);

    expect(registered?.component).toBe(HostsModifiedHighTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Hosts (High) by Modification Time',
    );
  });

  test('should render only high severity hosts in the table', async () => {
    renderDisplay(<HostsModifiedHighTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts (High) by Modification Time (Total: 8)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of Modified Hosts (High)|Total Hosts (High)',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent(
        '01/03/2026|3|8',
      );
      expect(screen.queryByText(/01\/02\/2026/)).toBeNull();
    });
  });
});
