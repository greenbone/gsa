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
  DfnCertCvssDisplay,
  DfnCertCvssTableDisplay,
} from 'web/pages/dfncert/dashboard/DfnCertCvssDisplay';

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
  dfncerts: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=dfn_cert_advisory', counts: {}},
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

describe('DfnCertCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(DfnCertCvssDisplay).toBeDefined();
    expect(typeof DfnCertCvssDisplay).toBe('function');
    expect(DfnCertCvssDisplay.displayId).toBe('dfn_cert_adv-by-cvss');
    expect(DfnCertCvssDisplay.displayName).toBe('DfnCertCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(DfnCertCvssDisplay.displayId);

    expect(registered?.component).toBe(DfnCertCvssDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: DFN-CERT Advisories by CVSS',
    );
  });

  test('should render the configured title and y-axis label', async () => {
    renderDisplay(<DfnCertCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'DFN-CERT Advisories by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent(
        '# of DFN-CERT Advs',
      );
    });
  });
});

describe('DfnCertCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(DfnCertCvssTableDisplay).toBeDefined();
    expect(typeof DfnCertCvssTableDisplay).toBe('function');
    expect(DfnCertCvssTableDisplay.displayId).toBe(
      'dfn_cert_adv-by-cvss-table',
    );
    expect(DfnCertCvssTableDisplay.displayName).toBe('DfnCertCvssTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(DfnCertCvssTableDisplay.displayId);

    expect(registered?.component).toBe(DfnCertCvssTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: DFN-CERT Advisories by CVSS',
    );
  });

  test('should render the configured title and table headings', async () => {
    renderDisplay(<DfnCertCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'DFN-CERT Advisories by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of DFN-CERT Advisories',
      );
    });
  });
});
