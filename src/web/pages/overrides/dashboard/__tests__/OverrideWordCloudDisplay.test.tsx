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
  OverridesWordCloudDisplay,
  OverridesWordCloudTableDisplay,
} from 'web/pages/overrides/dashboard/OverrideWordCloudDisplay';

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
            {dataRow(transformedData)?.[index]?.join('|')}
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
      meta: {filter: 'type=override', counts: {}},
    }),
  },
  overrides: {
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

describe('OverridesWordCloudDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OverridesWordCloudDisplay).toBeDefined();
    expect(typeof OverridesWordCloudDisplay).toBe('function');
    expect(OverridesWordCloudDisplay.displayId).toBe('override-by-text-words');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OverridesWordCloudDisplay.displayId);

    expect(registered?.component).toBe(OverridesWordCloudDisplay);
    expect(String(registered?.title)).toBe('Chart: Overrides Text Word Cloud');
  });

  test('should render the loaded words', async () => {
    renderDisplay(<OverridesWordCloudDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Overrides Text Word Cloud',
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

describe('OverridesWordCloudTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OverridesWordCloudTableDisplay).toBeDefined();
    expect(typeof OverridesWordCloudTableDisplay).toBe('function');
    expect(OverridesWordCloudTableDisplay.displayId).toBe(
      'override-by-text-words-table',
    );
    expect(OverridesWordCloudTableDisplay.displayName).toBe(
      'OverridesWordCloudTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OverridesWordCloudTableDisplay.displayId);

    expect(registered?.component).toBe(OverridesWordCloudTableDisplay);
    expect(String(registered?.title)).toBe('Table: Overrides Text Word Cloud');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<OverridesWordCloudTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Overrides Text Word Cloud',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent('Text|Count');
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('security|5');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('network|3');
    });
  });
});
