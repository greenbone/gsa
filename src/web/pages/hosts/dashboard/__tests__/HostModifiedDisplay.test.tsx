/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  HostsModifiedDisplay,
  HostsModifiedTableDisplay,
} from 'web/pages/hosts/dashboard/HostModifiedDisplay';

const loaderData = {
  groups: [
    {value: '2026-01-01', count: '5', c_count: '10'},
    {value: '2026-01-02', count: '7', c_count: '12'},
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
  default: ({data, onRangeSelected, xAxisLabel, yAxisLabel, y2AxisLabel}) => (
    <div data-testid="mock-line-chart">
      <span data-testid="x-axis-label">{xAxisLabel}</span>
      <span data-testid="y-axis-label">{yAxisLabel}</span>
      <span data-testid="y2-axis-label">{y2AxisLabel}</span>
      {data.map((row, index) => (
        <span key={index} data-testid={`data-point-${index}`}>
          {row.label}|{row.y}|{row.y2}
        </span>
      ))}
      <button onClick={() => onRangeSelected?.(data[0], data[data.length - 1])}>
        select-range
      </button>
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

const renderDisplay = (component: ReactElement, options = {}) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(), ...options});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('HostsModifiedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsModifiedDisplay).toBeDefined();
    expect(HostsModifiedDisplay.displayId).toBe('host-by-modification-time');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsModifiedDisplay.displayId);

    expect(registered?.component).toBe(HostsModifiedDisplay);
    expect(String(registered?.title)).toBe('Chart: Hosts by Modification Time');
  });

  test('should render the total and chart labels', async () => {
    renderDisplay(<HostsModifiedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts by Modification Time (Total: 12)',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of Modified Hosts',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total Hosts',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent('5|10');
      expect(screen.getByTestId('data-point-1')).toHaveTextContent('7|12');
    });
  });
});

describe('HostsModifiedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsModifiedTableDisplay).toBeDefined();
    expect(HostsModifiedTableDisplay.displayId).toBe(
      'host-by-modification-time-table',
    );
    expect(HostsModifiedTableDisplay.displayName).toBe(
      'HostsModifiedTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsModifiedTableDisplay.displayId);

    expect(registered?.component).toBe(HostsModifiedTableDisplay);
    expect(String(registered?.title)).toBe('Table: Hosts by Modification Time');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<HostsModifiedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts by Modification Time (Total: 12)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of Modified Hosts|Total Hosts',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent(
        '01/02/2026|7|12',
      );
    });
  });
});
