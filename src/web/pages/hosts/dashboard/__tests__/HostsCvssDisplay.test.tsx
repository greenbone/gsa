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
  HostsCvssDisplay,
  HostsCvssTableDisplay,
} from 'web/pages/hosts/dashboard/HostsCvssDisplay';

const loaderData = {
  groups: [
    {value: '2.0', count: 12},
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
  settings: {severityRating: 'CVSSv3'},
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

describe('HostsCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsCvssDisplay).toBeDefined();
    expect(typeof HostsCvssDisplay).toBe('function');
    expect(HostsCvssDisplay.displayId).toBe('host-by-cvss');
    expect(HostsCvssDisplay.displayName).toBe('HostsCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsCvssDisplay.displayId);

    expect(registered?.component).toBe(HostsCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: Hosts by CVSS');
  });

  test('should render the total and y-axis label', async () => {
    renderDisplay(<HostsCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent('# of Hosts');
    });
  });
});

describe('HostsCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsCvssTableDisplay).toBeDefined();
    expect(typeof HostsCvssTableDisplay).toBe('function');
    expect(HostsCvssTableDisplay.displayId).toBe('host-by-cvss-table');
    expect(HostsCvssTableDisplay.displayName).toBe('HostsCvssTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsCvssTableDisplay.displayId);

    expect(registered?.component).toBe(HostsCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: Hosts by CVSS');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<HostsCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Hosts by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of Hosts',
      );
    });
  });
});
