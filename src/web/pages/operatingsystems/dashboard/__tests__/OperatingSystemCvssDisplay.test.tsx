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
  OperatingSystemCvssDisplay,
  OperatingSystemCvssTableDisplay,
} from 'web/pages/operatingsystems/dashboard/OperatingSystemCvssDisplay';

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

describe('OperatingSystemCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OperatingSystemCvssDisplay).toBeDefined();
    expect(typeof OperatingSystemCvssDisplay).toBe('function');
    expect(OperatingSystemCvssDisplay.displayId).toBe('os-by-cvss');
    expect(OperatingSystemCvssDisplay.displayName).toBe('OsCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OperatingSystemCvssDisplay.displayId);

    expect(registered?.component).toBe(OperatingSystemCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: Operating Systems by CVSS');
  });

  test('should render the configured title and y-axis label', async () => {
    renderDisplay(<OperatingSystemCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Operating Systems by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('y-label')).toHaveTextContent(
        '# of Vulnerabilities',
      );
    });
  });
});

describe('OperatingSystemCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OperatingSystemCvssTableDisplay).toBeDefined();
    expect(typeof OperatingSystemCvssTableDisplay).toBe('function');
    expect(OperatingSystemCvssTableDisplay.displayId).toBe('os-by-cvss-table');
    expect(OperatingSystemCvssTableDisplay.displayName).toBe(
      'OsCvssTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OperatingSystemCvssTableDisplay.displayId);

    expect(registered?.component).toBe(OperatingSystemCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: Operating Systems by CVSS');
  });

  test('should render the configured title and table headings', async () => {
    renderDisplay(<OperatingSystemCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Operating Systems by CVSS (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of Operating Systems',
      );
    });
  });
});
