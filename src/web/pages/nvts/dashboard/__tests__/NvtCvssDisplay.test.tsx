/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  NvtsCvssDisplay,
  NvtsCvssTableDisplay,
} from 'web/pages/nvts/dashboard/NvtCvssDisplay';

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
  nvts: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=nvt', counts: {}},
    }),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(), store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('NvtsCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsCvssDisplay).toBeDefined();
    expect(NvtsCvssDisplay.displayId).toBe('nvt-by-cvss');
    expect(NvtsCvssDisplay.displayName).toBe('NvtsCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsCvssDisplay.displayId);

    expect(registered?.component).toBe(NvtsCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: NVTs by CVSS');
  });

  test('should render the configured title and y-axis label', async () => {
    renderDisplay(<NvtsCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent('# of NVTs');
    });
  });
});

describe('NvtsCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsCvssTableDisplay).toBeDefined();
    expect(NvtsCvssTableDisplay.displayId).toBe('nvt-by-cvss-table');
    expect(NvtsCvssTableDisplay.displayName).toBe('NvtsCvssTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsCvssTableDisplay.displayId);

    expect(registered?.component).toBe(NvtsCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: NVTs by CVSS');
  });

  test('should render the configured title and table headings', async () => {
    renderDisplay(<NvtsCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of NVTs',
      );
    });
  });
});
