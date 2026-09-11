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
  DfnCertSeverityClassDisplay,
  DfnCertSeverityClassTableDisplay,
} from 'web/pages/dfncert/dashboard/DfnCertSeverityClassDisplay';

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

describe('DfnCertSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(DfnCertSeverityClassDisplay).toBeDefined();
    expect(typeof DfnCertSeverityClassDisplay).toBe('function');
    expect(DfnCertSeverityClassDisplay.displayId).toBe(
      'dfn_cert_adv-by-severity-class',
    );
    expect(DfnCertSeverityClassDisplay.displayName).toBe(
      'DfnCertSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(DfnCertSeverityClassDisplay.displayId);

    expect(registered?.component).toBe(DfnCertSeverityClassDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: DFN-CERT Advisories by Severity Class',
    );
  });

  test('should render the total advisory count in the title', async () => {
    renderDisplay(<DfnCertSeverityClassDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'DFN-CERT Advisories by Severity Class (Total: 42)',
      );
    });
  });
});

describe('DfnCertSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(DfnCertSeverityClassTableDisplay).toBeDefined();
    expect(typeof DfnCertSeverityClassTableDisplay).toBe('function');
    expect(DfnCertSeverityClassTableDisplay.displayId).toBe(
      'dfn_cert_adv-by-severity-table',
    );
    expect(DfnCertSeverityClassTableDisplay.displayName).toBe(
      'DfnCertSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(DfnCertSeverityClassTableDisplay.displayId);

    expect(registered?.component).toBe(DfnCertSeverityClassTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: DFN-CERT Advisories by Severity Class',
    );
  });

  test('should render the total and table headings', async () => {
    renderDisplay(
      <DfnCertSeverityClassTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'DFN-CERT Advisories by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of DFN-CERT Advs',
      );
    });
  });
});
