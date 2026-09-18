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
  OverridesActiveDaysDisplay,
  OverridesActiveDaysTableDisplay,
} from 'web/pages/overrides/dashboard/OverrideActiveDaysDisplay';

const loaderData = {
  groups: [
    {value: -2, count: 2},
    {value: -1, count: 3},
    {value: 1, count: 5},
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
            {dataRow(row).join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/chart/DonutChart', () => ({
  default: ({data}) => (
    <div data-testid="mock-donut-chart">
      {data.map((row, index) => (
        <span key={index} data-testid={`data-point-${index}`}>
          {row.label}|{row.value}|{row.filterValue}
        </span>
      ))}
    </div>
  ),
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=override', counts: {}},
    }),
  },
  overrides: {
    getActiveDaysAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('OverridesActiveDaysDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OverridesActiveDaysDisplay).toBeDefined();
    expect(OverridesActiveDaysDisplay.displayId).toBe(
      'override-by-active-days',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OverridesActiveDaysDisplay.displayId);

    expect(registered?.component).toBe(OverridesActiveDaysDisplay);
    expect(String(registered?.title)).toBe('Chart: Overrides by Active Days');
  });

  test('should render the loaded data and chart labels', async () => {
    renderDisplay(<OverridesActiveDaysDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Overrides by Active Days (Total: 10)',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        'Active (unlimited)|2|-2',
      );
      expect(screen.getByTestId('data-point-1')).toHaveTextContent(
        'Inactive|3|-1',
      );
      expect(screen.getByTestId('data-point-2')).toHaveTextContent(
        'Active for the next 1 days|5|1',
      );
    });
  });
});

describe('OverridesActiveDaysTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OverridesActiveDaysTableDisplay).toBeDefined();
    expect(OverridesActiveDaysTableDisplay.displayId).toBe(
      'override-by-active-days-table',
    );
    expect(OverridesActiveDaysTableDisplay.displayName).toBe(
      'OverridesActiveDaysTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OverridesActiveDaysTableDisplay.displayId);

    expect(registered?.component).toBe(OverridesActiveDaysTableDisplay);
    expect(String(registered?.title)).toBe('Table: Overrides by Active Days');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<OverridesActiveDaysTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Overrides by Active Days (Total: 10)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Active|# of Overrides',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        'Active (unlimited)|2',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('Inactive|3');
      expect(screen.getByTestId('data-row-2')).toHaveTextContent(
        'Active for the next 1 days|5',
      );
    });
  });
});
