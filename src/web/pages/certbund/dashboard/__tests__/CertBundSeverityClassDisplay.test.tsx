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
  CertBundSeverityClassDisplay,
  CertBundSeverityClassTableDisplay,
} from 'web/pages/certbund/dashboard/CertBundSeverityClassDisplay';

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
  certbunds: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=cert_bund_advisory', counts: {}},
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

describe('CertBundSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CertBundSeverityClassDisplay).toBeDefined();
    expect(typeof CertBundSeverityClassDisplay).toBe('function');
    expect(CertBundSeverityClassDisplay.displayId).toBe(
      'cert_bund_adv-by-severity-class',
    );
    expect(CertBundSeverityClassDisplay.displayName).toBe(
      'CertBundSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CertBundSeverityClassDisplay.displayId);

    expect(registered?.component).toBe(CertBundSeverityClassDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: CERT-Bund Advisories by Severity Class',
    );
  });

  test('should render the total advisories count in the title', async () => {
    renderDisplay(<CertBundSeverityClassDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'CERT-Bund Advisories by Severity Class (Total: 42)',
      );
    });
  });
});

describe('CertBundSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CertBundSeverityClassTableDisplay).toBeDefined();
    expect(typeof CertBundSeverityClassTableDisplay).toBe('function');
    expect(CertBundSeverityClassTableDisplay.displayId).toBe(
      'cert_bund_adv-by-severity-table',
    );
    expect(CertBundSeverityClassTableDisplay.displayName).toBe(
      'CertBundSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CertBundSeverityClassTableDisplay.displayId);

    expect(registered?.component).toBe(CertBundSeverityClassTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: CERT-Bund Advisories by Severity Class',
    );
  });

  test('should render the total and table headings', async () => {
    renderDisplay(
      <CertBundSeverityClassTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CERT-Bund Advisories by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of CERT-Bund Advisories',
      );
    });
  });
});
