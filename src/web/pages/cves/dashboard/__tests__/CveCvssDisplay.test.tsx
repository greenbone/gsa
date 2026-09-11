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
  CvesCvssDisplay,
  CvesCvssTableDisplay,
} from 'web/pages/cves/dashboard/CveCvssDisplay';

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

describe('CvesCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CvesCvssDisplay).toBeDefined();
    expect(typeof CvesCvssDisplay).toBe('function');
    expect(CvesCvssDisplay.displayId).toBe('cve-by-cvss');
    expect(CvesCvssDisplay.displayName).toBe('CvesCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CvesCvssDisplay.displayId);

    expect(registered?.component).toBe(CvesCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: CVEs by CVSS');
  });

  test('should render the configured title and y-axis label', async () => {
    renderDisplay(<CvesCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CVEs by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent('# of CVEs');
    });
  });
});

describe('CvesCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CvesCvssTableDisplay).toBeDefined();
    expect(typeof CvesCvssTableDisplay).toBe('function');
    expect(CvesCvssTableDisplay.displayId).toBe('cve-by-cvss-table');
    expect(CvesCvssTableDisplay.displayName).toBe('CvesCvssTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CvesCvssTableDisplay.displayId);

    expect(registered?.component).toBe(CvesCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: CVEs by CVSS');
  });

  test('should render the configured title and table headings', async () => {
    renderDisplay(<CvesCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CVEs by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of CVEs',
      );
    });
  });
});
