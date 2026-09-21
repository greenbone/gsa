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
  default: ({children, data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.()}</span>
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
        <span data-testid="title">{title?.()}</span>
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

vi.mock('web/components/chart/WordCloudChart', () => ({
  default: ({data}) => (
    <div data-testid="mock-word-cloud-chart">
      {data.map((row, index) => (
        <span key={index} data-testid={`data-word-${index}`}>
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
    expect(typeof ResultsDescriptionWordCloudDisplay).toBe('function');
    expect(ResultsDescriptionWordCloudDisplay.displayId).toBe(
      'result-by-desc-words',
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
});

describe('ResultsDescriptionWordCloudTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsDescriptionWordCloudTableDisplay).toBeDefined();
    expect(typeof ResultsDescriptionWordCloudTableDisplay).toBe('function');
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
