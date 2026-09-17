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
  NvtsQodTypeDisplay,
  NvtsQodTypeTableDisplay,
} from 'web/pages/nvts/dashboard/NvtQodTypeDisplay';

const loaderData = {
  groups: [
    {value: 'general_note', count: 12},
    {value: 'remote_analysis', count: 30},
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
    getQodTypeAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('NvtsQodTypeDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsQodTypeDisplay).toBeDefined();
    expect(typeof NvtsQodTypeDisplay).toBe('function');
    expect(NvtsQodTypeDisplay.displayId).toBe('nvt-by-qod_type');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsQodTypeDisplay.displayId);

    expect(registered?.component).toBe(NvtsQodTypeDisplay);
    expect(String(registered?.title)).toBe('Chart: NVTs by QoD-Type');
  });

  test('should render loaded data and the total in the title', async () => {
    renderDisplay(<NvtsQodTypeDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by QoD-Type (Total: 42)',
      );
      expect(
        screen.getByRole('button', {name: 'General note'}),
      ).toBeInTheDocument();
    });
  });

  test('should call onFilterChanged with a QoD-type filter', async () => {
    const onFilterChanged = testing.fn();
    renderDisplay(
      <NvtsQodTypeDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const qodType = await screen.findByRole('button', {name: 'General note'});
    qodType.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'qod_type="general_note"',
    );
  });

  test('should not call onFilterChanged if the filter already has the QoD-type', async () => {
    const onFilterChanged = testing.fn();
    renderDisplay(
      <NvtsQodTypeDisplay
        filter={QueryFilter.fromString('qod_type="general_note"')}
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const qodType = await screen.findByRole('button', {name: 'General note'});
    qodType.click();

    expect(onFilterChanged).not.toHaveBeenCalled();
  });
});

describe('NvtsQodTypeTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsQodTypeTableDisplay).toBeDefined();
    expect(typeof NvtsQodTypeTableDisplay).toBe('function');
    expect(NvtsQodTypeTableDisplay.displayId).toBe('nvt-by-qod-type-table');
    expect(NvtsQodTypeTableDisplay.displayName).toBe('NvtsQodTypeTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsQodTypeTableDisplay.displayId);

    expect(registered?.component).toBe(NvtsQodTypeTableDisplay);
    expect(String(registered?.title)).toBe('Table: NVTs by QoD-Type');
  });

  test('should render loaded table data and the total in the title', async () => {
    renderDisplay(<NvtsQodTypeTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by QoD-Type (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'QoD-Type|# of NVTs',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        'General note|12',
      );
    });
  });
});
