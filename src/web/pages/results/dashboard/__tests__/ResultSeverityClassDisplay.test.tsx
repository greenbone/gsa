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
  ResultsSeverityDisplay,
  ResultsSeverityTableDisplay,
} from 'web/pages/results/dashboard/ResultSeverityClassDisplay';

const loaderData = {
  groups: [
    {value: '2.0', count: 12},
    {value: '7.5', count: 30},
  ],
};

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassDisplay',
  () => ({
    default: ({data, title}) => {
      const total =
        data?.groups?.reduce((sum, group) => sum + Number(group.count), 0) ?? 0;

      return (
        <div data-testid="mock-severity-display">
          {title?.({data: {total}})}
        </div>
      );
    },
  }),
);

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassTableDisplay',
  () => ({
    default: ({data, dataTitles, title}) => {
      const total =
        data?.groups?.reduce((sum, group) => sum + Number(group.count), 0) ?? 0;

      return (
        <div data-testid="mock-severity-table-display">
          <span data-testid="title">{title?.({data: {total}})}</span>
          <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        </div>
      );
    },
  }),
);

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=result', counts: {}},
    }),
  },
  results: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('ResultsSeverityDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsSeverityDisplay).toBeDefined();
    expect(typeof ResultsSeverityDisplay).toBe('function');
    expect(ResultsSeverityDisplay.displayId).toBe('result-by-severity-class');
    expect(ResultsSeverityDisplay.displayName).toBe('ResultsSeverityDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ResultsSeverityDisplay.displayId);

    expect(registered?.component).toBe(ResultsSeverityDisplay);
    expect(String(registered?.title)).toBe('Chart: Results by Severity Class');
  });

  test('should render the total loaded result count', async () => {
    renderDisplay(<ResultsSeverityDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'Results by Severity Class (Total: 42)',
      );
    });
  });
});

describe('ResultsSeverityTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ResultsSeverityTableDisplay).toBeDefined();
    expect(typeof ResultsSeverityTableDisplay).toBe('function');
    expect(ResultsSeverityTableDisplay.displayId).toBe(
      'result-by-severity-class-table',
    );
    expect(ResultsSeverityTableDisplay.displayName).toBe(
      'ResultsSeverityTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ResultsSeverityTableDisplay.displayId);

    expect(registered?.component).toBe(ResultsSeverityTableDisplay);
    expect(String(registered?.title)).toBe('Table: Results by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<ResultsSeverityTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Results by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of Results',
      );
    });
  });
});
