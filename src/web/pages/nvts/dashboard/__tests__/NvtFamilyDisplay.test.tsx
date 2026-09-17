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
  NvtsFamilyDisplay,
  NvtsFamilyTableDisplay,
} from 'web/pages/nvts/dashboard/NvtFamilyDisplay';

const loaderData = {
  groups: [
    {value: 'Linux', count: 12, stats: {severity: {mean: 5.2}}},
    {value: 'Windows', count: 30, stats: {severity: {mean: 7.5}}},
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
        <span data-testid="title">
          {title?.({data: transformedData, originalData: data})}
        </span>
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

vi.mock('web/components/chart/BubbleChart', () => ({
  default: ({data, onDataClick}) => (
    <div data-testid="mock-bubble-chart">
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
    getFamilyAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  settings: {severityRating: 'CVSSv3'},
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

describe('NvtsFamilyDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsFamilyDisplay).toBeDefined();
    expect(NvtsFamilyDisplay.displayId).toBe('nvt-by-family');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsFamilyDisplay.displayId);

    expect(registered?.component).toBe(NvtsFamilyDisplay);
    expect(String(registered?.title)).toBe('Chart: NVTs by Family');
  });

  test('should render loaded data and the total in the title', async () => {
    renderDisplay(<NvtsFamilyDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by Family (Total: 42)',
      );
      expect(screen.getByRole('button', {name: 'Linux'})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Windows'})).toBeInTheDocument();
    });
  });

  test('should call onFilterChanged with a family filter', async () => {
    const onFilterChanged = testing.fn();
    renderDisplay(
      <NvtsFamilyDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const family = await screen.findByRole('button', {name: 'Linux'});
    family.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'family="Linux"',
    );
  });

  test('should not call onFilterChanged if the filter already has the family', async () => {
    const onFilterChanged = testing.fn();
    renderDisplay(
      <NvtsFamilyDisplay
        filter={QueryFilter.fromString('family="Linux"')}
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const family = await screen.findByRole('button', {name: 'Linux'});
    family.click();

    expect(onFilterChanged).not.toHaveBeenCalled();
  });
});

describe('NvtsFamilyTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsFamilyTableDisplay).toBeDefined();
    expect(NvtsFamilyTableDisplay.displayId).toBe('nvt-by-family-table');
    expect(NvtsFamilyTableDisplay.displayName).toBe('NvtsFamilyTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsFamilyTableDisplay.displayId);

    expect(registered?.component).toBe(NvtsFamilyTableDisplay);
    expect(String(registered?.title)).toBe('Table: NVTs by Family');
  });

  test('should render loaded table data and the total in the title', async () => {
    renderDisplay(<NvtsFamilyTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by Family (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'NVT Family|# of NVTs|Severity',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('Linux|12');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('Windows|30');
    });
  });
});
