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
  OperatingSystemSeverityClassDisplay,
  OperatingSystemSeverityClassTableDisplay,
} from 'web/pages/operatingsystems/dashboard/OperatingSystemSeverityClassDisplay';

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
  operatingsystems: {
    getAverageSeverityAggregates: testing.fn().mockResolvedValue({
      data: loaderData,
    }),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=os', counts: {}},
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

describe('OperatingSystemSeverityClassDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OperatingSystemSeverityClassDisplay).toBeDefined();
    expect(typeof OperatingSystemSeverityClassDisplay).toBe('function');
    expect(OperatingSystemSeverityClassDisplay.displayId).toBe(
      'os-by-severity-class',
    );
    expect(OperatingSystemSeverityClassDisplay.displayName).toBe(
      'OsSeverityClassDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      OperatingSystemSeverityClassDisplay.displayId,
    );

    expect(registered?.component).toBe(OperatingSystemSeverityClassDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Operating Systems by Severity Class',
    );
  });

  test('should render the total loaded operating system count', async () => {
    renderDisplay(
      <OperatingSystemSeverityClassDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'Operating Systems by Severity Class (Total: 42)',
      );
    });
  });
});

describe('OperatingSystemSeverityClassTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OperatingSystemSeverityClassTableDisplay).toBeDefined();
    expect(typeof OperatingSystemSeverityClassTableDisplay).toBe('function');
    expect(OperatingSystemSeverityClassTableDisplay.displayId).toBe(
      'os-by-severity-table',
    );
    expect(OperatingSystemSeverityClassTableDisplay.displayName).toBe(
      'OsSeverityClassTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      OperatingSystemSeverityClassTableDisplay.displayId,
    );

    expect(registered?.component).toBe(
      OperatingSystemSeverityClassTableDisplay,
    );
    expect(String(registered?.title)).toBe(
      'Table: Operating Systems by Severity Class',
    );
  });

  test('should render the total and table headings', async () => {
    renderDisplay(
      <OperatingSystemSeverityClassTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Operating Systems by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity Class|# of Operating Systems',
      );
    });
  });
});
