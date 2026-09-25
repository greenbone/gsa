/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  NvtsQodDisplay,
  NvtsQodTableDisplay,
} from 'web/pages/nvts/dashboard/NvtQodDisplay';

const loaderData = {
  groups: [
    {value: '80', count: 12},
    {value: '100', count: 30},
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

vi.mock('web/components/chart/DonutChart', () => ({
  default: ({data, onDataClick}) => (
    <div data-testid="mock-donut-chart">
      {data.map(d => (
        <button key={d.label} onClick={() => onDataClick?.(d)}>
          {d.label}
        </button>
      ))}
    </div>
  ),
}));

const createGmp = () => ({
  nvts: {
    getQodAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=nvt', counts: {}},
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

describe('NvtsQodDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsQodDisplay).toBeDefined();
    expect(NvtsQodDisplay.displayId).toBe('nvt-by-qod');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsQodDisplay.displayId);

    expect(registered?.component).toBe(NvtsQodDisplay);
    expect(String(registered?.title)).toBe('Chart: NVTs by QoD');
  });

  test('should render loaded data and the total in the title', async () => {
    renderDisplay(<NvtsQodDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by QoD (Total: 42)',
      );
      expect(screen.getByRole('button', {name: '80 %'})).toBeInTheDocument();
    });
  });

  test('should call onFilterChanged with a QoD filter', async () => {
    const onFilterChanged = testing.fn();
    renderDisplay(
      <NvtsQodDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const qod = await screen.findByRole('button', {name: '80 %'});
    qod.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe('qod="80"');
  });

  test('should not call onFilterChanged if the filter already has the QoD', async () => {
    const onFilterChanged = testing.fn();
    renderDisplay(
      <NvtsQodDisplay
        filter={QueryFilter.fromString('qod="80"')}
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const qod = await screen.findByRole('button', {name: '80 %'});
    qod.click();

    expect(onFilterChanged).not.toHaveBeenCalled();
  });
});

describe('NvtsQodTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsQodTableDisplay).toBeDefined();
    expect(NvtsQodTableDisplay.displayId).toBe('nvt-by-qod-table');
    expect(NvtsQodTableDisplay.displayName).toBe('NvtsQodTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsQodTableDisplay.displayId);

    expect(registered?.component).toBe(NvtsQodTableDisplay);
    expect(String(registered?.title)).toBe('Table: NVTs by QoD');
  });

  test('should render loaded table data and the total in the title', async () => {
    renderDisplay(<NvtsQodTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by QoD (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'QoD|# of NVTs',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('80 %|12');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('100 %|30');
    });
  });
});
