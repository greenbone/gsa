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
  CpesSeverityClassDisplay,
  CpesSeverityClassTableDisplay,
} from 'web/pages/cpes/dashboard/CpeSeverityClassDisplay';

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
  cpes: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=cpe', counts: {}},
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

describe('CpesSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CpesSeverityClassDisplay).toBeDefined();
    expect(typeof CpesSeverityClassDisplay).toBe('function');
    expect(CpesSeverityClassDisplay.displayId).toBe('cpe-by-severity-class');
    expect(CpesSeverityClassDisplay.displayName).toBe(
      'CpesSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CpesSeverityClassDisplay.displayId);

    expect(registered?.component).toBe(CpesSeverityClassDisplay);
    expect(String(registered?.title)).toBe('Chart: CPEs by Severity Class');
  });

  test('should render the total CPE count in the title', async () => {
    renderDisplay(<CpesSeverityClassDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'CPEs by Severity Class (Total: 42)',
      );
    });
  });
});

describe('CpesSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CpesSeverityClassTableDisplay).toBeDefined();
    expect(typeof CpesSeverityClassTableDisplay).toBe('function');
    expect(CpesSeverityClassTableDisplay.displayId).toBe(
      'cpe-by-severity-table',
    );
    expect(CpesSeverityClassTableDisplay.displayName).toBe(
      'CpesSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CpesSeverityClassTableDisplay.displayId);

    expect(registered?.component).toBe(CpesSeverityClassTableDisplay);
    expect(String(registered?.title)).toBe('Table: CPEs by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<CpesSeverityClassTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CPEs by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of CPEs',
      );
    });
  });
});
