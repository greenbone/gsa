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
  ReportsSeverityDisplay,
  ReportsSeverityTableDisplay,
} from 'web/pages/reports/dashboard/ReportSeverityClassDisplay';

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
  reports: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=report', counts: {}},
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

describe('ReportsSeverityDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ReportsSeverityDisplay).toBeDefined();
    expect(typeof ReportsSeverityDisplay).toBe('function');
    expect(ReportsSeverityDisplay.displayId).toBe('report-by-severity-class');
    expect(ReportsSeverityDisplay.displayName).toBe('ReportsSeverityDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ReportsSeverityDisplay.displayId);

    expect(registered?.component).toBe(ReportsSeverityDisplay);
    expect(String(registered?.title)).toBe('Chart: Reports by Severity Class');
  });

  test('should render the total loaded report count', async () => {
    renderDisplay(<ReportsSeverityDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'Reports by Severity Class (Total: 42)',
      );
    });
  });
});

describe('ReportsSeverityTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(ReportsSeverityTableDisplay).toBeDefined();
    expect(typeof ReportsSeverityTableDisplay).toBe('function');
    expect(ReportsSeverityTableDisplay.displayId).toBe(
      'report-by-severity-class-table',
    );
    expect(ReportsSeverityTableDisplay.displayName).toBe(
      'ReportsSeverityTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(ReportsSeverityTableDisplay.displayId);

    expect(registered?.component).toBe(ReportsSeverityTableDisplay);
    expect(String(registered?.title)).toBe('Table: Reports by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<ReportsSeverityTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Reports by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of Reports',
      );
    });
  });
});
