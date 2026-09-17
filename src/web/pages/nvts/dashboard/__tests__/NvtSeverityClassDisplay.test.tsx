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
  NvtsSeverityClassDisplay,
  NvtsSeverityClassTableDisplay,
} from 'web/pages/nvts/dashboard/NvtSeverityClassDisplay';

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
  nvts: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  settings: {severityRating: 'CVSSv3'},
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

describe('NvtsSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsSeverityClassDisplay).toBeDefined();
    expect(NvtsSeverityClassDisplay.displayId).toBe('nvt-by-severity-class');
    expect(NvtsSeverityClassDisplay.displayName).toBe(
      'NvtsSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsSeverityClassDisplay.displayId);

    expect(registered?.component).toBe(NvtsSeverityClassDisplay);
    expect(String(registered?.title)).toBe('Chart: NVTs by Severity Class');
  });

  test('should render the total loaded NVT count', async () => {
    renderDisplay(<NvtsSeverityClassDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'NVTs by Severity Class (Total: 42)',
      );
    });
  });
});

describe('NvtsSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsSeverityClassTableDisplay).toBeDefined();
    expect(NvtsSeverityClassTableDisplay.displayId).toBe(
      'nvt-by-severity-table',
    );
    expect(NvtsSeverityClassTableDisplay.displayName).toBe(
      'NvtsSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsSeverityClassTableDisplay.displayId);

    expect(registered?.component).toBe(NvtsSeverityClassTableDisplay);
    expect(String(registered?.title)).toBe('Table: NVTs by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<NvtsSeverityClassTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of NVTs',
      );
    });
  });
});
