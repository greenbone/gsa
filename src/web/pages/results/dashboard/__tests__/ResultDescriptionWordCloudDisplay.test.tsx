/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  ResultsDescriptionWordCloudDisplay,
  ResultsDescriptionWordCloudTableDisplay,
} from 'web/pages/results/dashboard/ResultDescriptionWordCloudDisplay';

const loaderData = {
  groups: [
    {value: 'security issue', count: 5},
    {value: 'network service', count: 3},
  ],
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, showToggleLegend, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.()}</span>
        <span data-testid="show-toggle-legend">{String(showToggleLegend)}</span>
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
  default: ({data, dataRow, dataTitles, title}) => {
    const rowData = dataRow(data);
    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.(data)}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {rowData?.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {row?.join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/chart/WordCloudChart', () => ({
  default: ({data, onDataClick}) => (
    <div data-testid="mock-word-cloud-chart">
      {data.map((row, index) => (
        <button
          key={index}
          data-testid={`data-word-${index}`}
          onClick={() => onDataClick?.(row.filterValue)}
        >
          {row.label}|{row.value}|{row.filterValue}
        </button>
      ))}
      <button
        data-testid="empty-filter-value"
        onClick={() => onDataClick?.(String())}
      >
        empty
      </button>
    </div>
  ),
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=result', counts: {}},
    }),
  },
  results: {
    getDescriptionWordCountsAggregates: testing.fn().mockResolvedValue({
      data: loaderData,
    }),
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

describe('ResultsDescriptionWordCloudDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsDescriptionWordCloudDisplay).toBeDefined();
    expect(ResultsDescriptionWordCloudDisplay.displayId).toBe(
      'result-by-desc-words',
    );
    expect(ResultsDescriptionWordCloudDisplay.displayName).toBe(
      'ResultsDescriptionWordCloudDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ResultsDescriptionWordCloudDisplay.displayId);

    expect(registered?.component).toBe(ResultsDescriptionWordCloudDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Results Description Word Cloud',
    );
  });

  test('should render the loaded words', async () => {
    renderDisplay(
      <ResultsDescriptionWordCloudDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Results Description Word Cloud',
      );
      expect(screen.getByTestId('data-word-0')).toHaveTextContent(
        'security issue|5|security issue',
      );
      expect(screen.getByTestId('data-word-1')).toHaveTextContent(
        'network service|3|network service',
      );
    });
  });

  test('should set showToggleLegend to false', async () => {
    renderDisplay(
      <ResultsDescriptionWordCloudDisplay height={200} width={200} />,
    );

    expect(await screen.findByTestId('show-toggle-legend')).toHaveTextContent(
      'false',
    );
  });

  test('should call onFilterChanged with a description filter when clicking a word', async () => {
    const onFilterChanged = testing.fn();

    renderDisplay(
      <ResultsDescriptionWordCloudDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    fireEvent.click(await screen.findByTestId('data-word-0'));

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'description~"security issue"',
    );
  });

  test('should not add a description filter that already exists', async () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('description~"security issue"');

    renderDisplay(
      <ResultsDescriptionWordCloudDisplay
        filter={filter}
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    fireEvent.click(await screen.findByTestId('data-word-0'));

    expect(onFilterChanged).not.toHaveBeenCalled();
  });

  test('should ignore an empty word', async () => {
    const onFilterChanged = testing.fn();

    renderDisplay(
      <ResultsDescriptionWordCloudDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    fireEvent.click(await screen.findByTestId('empty-filter-value'));

    expect(onFilterChanged).not.toHaveBeenCalled();
  });

  test('should not throw when clicking a word without onFilterChanged', async () => {
    renderDisplay(
      <ResultsDescriptionWordCloudDisplay height={200} width={200} />,
    );

    const button = await screen.findByTestId('data-word-0');

    expect(() => fireEvent.click(button)).not.toThrow();
  });
});

describe('ResultsDescriptionWordCloudTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsDescriptionWordCloudTableDisplay).toBeDefined();
    expect(ResultsDescriptionWordCloudTableDisplay.displayId).toBe(
      'result-by-desc-words-table',
    );
    expect(ResultsDescriptionWordCloudTableDisplay.displayName).toBe(
      'ResultsDescriptionWordCloudTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      ResultsDescriptionWordCloudTableDisplay.displayId,
    );

    expect(registered?.component).toBe(ResultsDescriptionWordCloudTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Results Description Word Cloud',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(
      <ResultsDescriptionWordCloudTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Results Description Word Cloud',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Description|Word Count',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        'security issue|5',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent(
        'network service|3',
      );
    });
  });
});
