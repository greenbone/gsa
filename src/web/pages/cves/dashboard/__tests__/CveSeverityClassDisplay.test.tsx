/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  CvesSeverityClassDisplay,
  CvesSeverityClassTableDisplay,
} from 'web/pages/cves/dashboard/CveSeverityClassDisplay';

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
  cves: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=cve', counts: {}},
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

describe('CvesSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CvesSeverityClassDisplay).toBeDefined();
    expect(typeof CvesSeverityClassDisplay).toBe('function');
    expect(CvesSeverityClassDisplay.displayId).toBe('cve-by-severity-class');
    expect(CvesSeverityClassDisplay.displayName).toBe(
      'CvesSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CvesSeverityClassDisplay.displayId);

    expect(registered?.component).toBe(CvesSeverityClassDisplay);
    expect(String(registered?.title)).toBe('Chart: CVEs by Severity Class');
  });

  test('should render the total CVE count in the title', async () => {
    renderDisplay(<CvesSeverityClassDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'CVEs by Severity Class (Total: 42)',
      );
    });
  });
});

describe('CvesSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CvesSeverityClassTableDisplay).toBeDefined();
    expect(typeof CvesSeverityClassTableDisplay).toBe('function');
    expect(CvesSeverityClassTableDisplay.displayId).toBe(
      'cve-by-severity-table',
    );
    expect(CvesSeverityClassTableDisplay.displayName).toBe(
      'CvesSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CvesSeverityClassTableDisplay.displayId);

    expect(registered?.component).toBe(CvesSeverityClassTableDisplay);
    expect(String(registered?.title)).toBe('Table: CVEs by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<CvesSeverityClassTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CVEs by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of CVEs',
      );
    });
  });
});
