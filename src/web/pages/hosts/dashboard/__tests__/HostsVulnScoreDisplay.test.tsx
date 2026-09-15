/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {type ReactElement} from 'react';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  HostsVulnScoreDisplay,
  HostsVulnScoreTableDisplay,
} from 'web/pages/hosts/dashboard/HostsVulnScoreDisplay';

const loaderData = {
  groups: [
    {
      value: 'host-1',
      text: {name: 'Host One', modified: '2026-01-02T12:00:00Z'},
      stats: {severity: {max: 8.5, mean: 7.5}},
    },
    {
      value: 'host-2',
      text: {name: 'Host Two', modified: '2026-01-03T12:00:00Z'},
      stats: {severity: {max: 0, mean: 0}},
    },
    {
      value: 'host-3',
      text: {name: 'Host Three', modified: '2026-01-04T12:00:00Z'},
      stats: {severity: {max: 4, mean: 2}},
    },
  ],
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, severityRating, title}) => {
    const transformedData = dataTransform
      ? dataTransform(data, {severityRating})
      : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {typeof children === 'function'
          ? children({
              width: 400,
              height: 300,
              data: transformedData,
              svgRef: {current: null},
            })
          : children}
      </div>
    );
  },
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({
    data,
    dataRow,
    dataTitles,
    dataTransform,
    severityRating,
    title,
  }) => {
    const transformedData = dataTransform
      ? dataTransform(data, {severityRating})
      : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {transformedData.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(row).join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/chart/BarChart', () => ({
  default: ({data, onDataClick}) => (
    <div data-testid="mock-bar-chart">
      {data.map(row => (
        <button key={row.id} onClick={() => onDataClick?.(row)}>
          bar-{row.x}
        </button>
      ))}
    </div>
  ),
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
    getVulnScoreAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('HostsVulnScoreDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsVulnScoreDisplay).toBeDefined();
    expect(HostsVulnScoreDisplay.displayId).toBe('host-by-most-vulnerable');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsVulnScoreDisplay.displayId);

    expect(registered?.component).toBe(HostsVulnScoreDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Hosts by Vulnerability Score',
    );
  });

  test('should render only scored hosts in reverse score order', async () => {
    renderDisplay(<HostsVulnScoreDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Most Vulnerable Hosts',
      );
      expect(
        screen.getByRole('button', {name: 'bar-Host Three'}),
      ).toBeVisible();
      expect(screen.getByRole('button', {name: 'bar-Host One'})).toBeVisible();
      expect(screen.queryByRole('button', {name: 'bar-Host Two'})).toBeNull();
    });
  });

  test('should navigate to the selected host', async () => {
    const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
    const {render} = rendererWith({gmp: createGmp(), showLocation: true});
    render(
      <SubscriptionContext.Provider value={subscribe}>
        <HostsVulnScoreDisplay height={200} width={200} />
      </SubscriptionContext.Provider>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'bar-Host One'})).toBeVisible(),
    );
    screen.getByRole('button', {name: 'bar-Host One'}).click();

    await waitFor(() =>
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/host/host-1',
      ),
    );
  });
});

describe('HostsVulnScoreTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsVulnScoreTableDisplay).toBeDefined();
    expect(HostsVulnScoreTableDisplay.displayId).toBe(
      'HostsVulnScoreTableDisplay',
    );
    expect(HostsVulnScoreTableDisplay.displayName).toBe(
      'host-by-most-vulnerable-table',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsVulnScoreTableDisplay.displayId);

    expect(registered?.component).toBe(HostsVulnScoreTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Hosts by Vulnerability Score',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(<HostsVulnScoreTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Most Vulnerable Hosts',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Host Name|Max. average Severity Score',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        'Host Three|4',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent(
        'Host One|8.5',
      );
      expect(screen.queryByText(/Host Two/)).toBeNull();
    });
  });
});
