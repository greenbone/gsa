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
  CpesCvssDisplay,
  CpesCvssTableDisplay,
} from 'web/pages/cpes/dashboard/CpeCvssDisplay';

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

describe('CpesCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CpesCvssDisplay).toBeDefined();
    expect(typeof CpesCvssDisplay).toBe('function');
    expect(CpesCvssDisplay.displayId).toBe('cpe-by-cvss');
    expect(CpesCvssDisplay.displayName).toBe('CpesCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CpesCvssDisplay.displayId);

    expect(registered?.component).toBe(CpesCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: CPEs by CVSS');
  });

  test('should render the configured title and y-axis label', async () => {
    renderDisplay(<CpesCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CPEs by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent('# of CPEs');
    });
  });
});

describe('CpesCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CpesCvssTableDisplay).toBeDefined();
    expect(typeof CpesCvssTableDisplay).toBe('function');
    expect(CpesCvssTableDisplay.displayId).toBe('cpe-by-cvss-table');
    expect(CpesCvssTableDisplay.displayName).toBe('CpesCvssTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CpesCvssTableDisplay.displayId);

    expect(registered?.component).toBe(CpesCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: CPEs by CVSS');
  });

  test('should render the configured title and table headings', async () => {
    renderDisplay(<CpesCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CPEs by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of CPEs',
      );
    });
  });
});
