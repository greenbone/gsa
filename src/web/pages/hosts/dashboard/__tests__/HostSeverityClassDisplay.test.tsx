/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  HostsSeverityClassDisplay,
  HostsSeverityClassTableDisplay,
} from 'web/pages/hosts/dashboard/HostSeverityClassDisplay';

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
          <span data-testid="title">{title?.({data: {total}})}</span>
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
      meta: {filter: 'type=host', counts: {}},
    }),
  },
  hosts: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('HostsSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsSeverityClassDisplay).toBeDefined();
    expect(typeof HostsSeverityClassDisplay).toBe('function');
    expect(HostsSeverityClassDisplay.displayId).toBe('host-by-severity-class');
    expect(HostsSeverityClassDisplay.displayName).toBe(
      'HostsSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsSeverityClassDisplay.displayId);

    expect(registered?.component).toBe(HostsSeverityClassDisplay);
    expect(String(registered?.title)).toBe('Chart: Hosts by Severity Class');
  });

  test('should render the total host count', async () => {
    renderDisplay(<HostsSeverityClassDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts by Severity Class (Total: 42)',
      );
    });
  });
});

describe('HostsSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsSeverityClassTableDisplay).toBeDefined();
    expect(typeof HostsSeverityClassTableDisplay).toBe('function');
    expect(HostsSeverityClassTableDisplay.displayId).toBe(
      'host-by-severity-class-table',
    );
    expect(HostsSeverityClassTableDisplay.displayName).toBe(
      'HostsSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsSeverityClassTableDisplay.displayId);

    expect(registered?.component).toBe(HostsSeverityClassTableDisplay);
    expect(String(registered?.title)).toBe('Table: Hosts by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<HostsSeverityClassTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of Hosts',
      );
    });
  });
});
