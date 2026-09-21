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
  ResultsWordCloudDisplay,
  ResultsWordCloudTableDisplay,
} from 'web/pages/results/dashboard/ResultWordCloudDisplay';

const loaderData = {
  groups: [
    {value: 'security', count: 5},
    {value: 'network', count: 3},
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
    getWordCountsAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('ResultsWordCloudDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsWordCloudDisplay).toBeDefined();
    expect(typeof ResultsWordCloudDisplay).toBe('function');
    expect(ResultsWordCloudDisplay.displayId).toBe('result-by-vuln-words');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ResultsWordCloudDisplay.displayId);

    expect(registered?.component).toBe(ResultsWordCloudDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Results Vulnerability Word Cloud',
    );
  });

  test('should render the loaded words', async () => {
    renderDisplay(<ResultsWordCloudDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Results Vulnerability Word Cloud',
      );
      expect(screen.getByTestId('data-word-0')).toHaveTextContent(
        'security|5|security',
      );
      expect(screen.getByTestId('data-word-1')).toHaveTextContent(
        'network|3|network',
      );
    });
  });
});

describe('ResultsWordCloudTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsWordCloudTableDisplay).toBeDefined();
    expect(typeof ResultsWordCloudTableDisplay).toBe('function');
    expect(ResultsWordCloudTableDisplay.displayId).toBe(
      'result-by-vuln-words-table',
    );
    expect(ResultsWordCloudTableDisplay.displayName).toBe(
      'ResultsWordCloudTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ResultsWordCloudTableDisplay.displayId);

    expect(registered?.component).toBe(ResultsWordCloudTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Results Vulnerability Word Cloud',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(<ResultsWordCloudTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Results Vulnerability Word Cloud',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Vulnerability|Word Count',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('security|5');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('network|3');
    });
  });
});
