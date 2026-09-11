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
  CertBundCvssDisplay,
  CertBundCvssTableDisplay,
} from 'web/pages/certbund/dashboard/CertBundCvssDisplay';

const loaderData = {
  groups: [
    {value: '0.2', count: 12},
    {value: '7.5', count: 30},
  ],
};

vi.mock('web/components/dashboard/display/cvss/CvssDisplay', () => ({
  default: ({data, title, yLabel}) => {
    const total =
      data?.groups?.reduce((sum, group) => sum + Number(group.count), 0) ?? 0;

    return (
      <div data-testid="mock-cvss-display">
        <span data-testid="title">{title?.({data: {total}})}</span>
        <span data-testid="y-label">{yLabel}</span>
      </div>
    );
  },
}));

vi.mock('web/components/dashboard/display/cvss/CvssTableDisplay', () => ({
  default: ({data, dataTitles, title}) => {
    const total =
      data?.groups?.reduce((sum, group) => sum + Number(group.count), 0) ?? 0;

    return (
      <div data-testid="mock-cvss-table-display">
        <span data-testid="title">{title?.({data: {total}})}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
      </div>
    );
  },
}));

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

describe('CertBundCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CertBundCvssDisplay).toBeDefined();
    expect(typeof CertBundCvssDisplay).toBe('function');
    expect(CertBundCvssDisplay.displayId).toBe('cert_bund_adv-by-cvss');
    expect(CertBundCvssDisplay.displayName).toBe('CertBundCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CertBundCvssDisplay.displayId);

    expect(registered?.component).toBe(CertBundCvssDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: CERT-Bund Advisories by CVSS',
    );
  });

  test('should render the configured title and y-axis label', async () => {
    renderDisplay(<CertBundCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CERT-Bund Advisories by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent(
        '# of CERT-Bund Advs',
      );
    });
  });
});

describe('CertBundCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CertBundCvssTableDisplay).toBeDefined();
    expect(typeof CertBundCvssTableDisplay).toBe('function');
    expect(CertBundCvssTableDisplay.displayId).toBe(
      'cert_bund_adv-by-cvss-table',
    );
    expect(CertBundCvssTableDisplay.displayName).toBe(
      'CertBundCvssTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CertBundCvssTableDisplay.displayId);

    expect(registered?.component).toBe(CertBundCvssTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: CERT-Bund Advisories by CVSS',
    );
  });

  test('should render the configured title and table headings', async () => {
    renderDisplay(<CertBundCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CERT-Bund Advisories by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of CERT-Bund Advisories',
      );
    });
  });
});
