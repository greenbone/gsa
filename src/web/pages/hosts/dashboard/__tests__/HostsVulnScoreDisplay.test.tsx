/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  HostsVulnerabilityScoreDisplay,
  HostsVulnerabilityScoreTableDisplay,
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
  default: ({
    children,
    data,
    dataTransform,
    severityRating,
    showToggleLegend,
    title,
  }) => {
    const transformedData = dataTransform
      ? dataTransform(data, {severityRating})
      : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        <span data-testid="show-toggle-legend">{String(showToggleLegend)}</span>
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
            {dataRow(transformedData)?.[index]?.join('|')}
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
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
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

const renderDisplay = (
  component: ReactElement,
  {showLocation}: {showLocation?: boolean} = {},
) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(), showLocation});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('HostsVulnScoreDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsVulnerabilityScoreDisplay).toBeDefined();
    expect(HostsVulnerabilityScoreDisplay.displayId).toBe(
      'host-by-most-vulnerable',
    );
    expect(HostsVulnerabilityScoreDisplay.displayName).toBe(
      'HostsVulnScoreDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsVulnerabilityScoreDisplay.displayId);

    expect(registered?.component).toBe(HostsVulnerabilityScoreDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Hosts by Vulnerability Score',
    );
  });

  test('should render only scored hosts in reverse score order', async () => {
    renderDisplay(<HostsVulnerabilityScoreDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Most Vulnerable Hosts',
      );
      expect(screen.getByTestId('show-toggle-legend')).toHaveTextContent(
        'false',
      );
      expect(
        screen.getByRole('button', {name: 'bar-Host Three'}),
      ).toBeVisible();
      expect(screen.getByRole('button', {name: 'bar-Host One'})).toBeVisible();
      expect(screen.queryByRole('button', {name: 'bar-Host Two'})).toBeNull();
    });
  });

  test('should navigate to the selected host', async () => {
    renderDisplay(<HostsVulnerabilityScoreDisplay height={200} width={200} />, {
      showLocation: true,
    });

    const button = await screen.findByRole('button', {name: 'bar-Host One'});
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/host/host-1',
      ),
    );
  });
});

describe('HostsVulnScoreTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsVulnerabilityScoreTableDisplay).toBeDefined();
    expect(HostsVulnerabilityScoreTableDisplay.displayName).toBe(
      'HostsVulnScoreTableDisplay',
    );
    expect(HostsVulnerabilityScoreTableDisplay.displayId).toBe(
      'host-by-most-vulnerable-table',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      HostsVulnerabilityScoreTableDisplay.displayId,
    );

    expect(registered?.component).toBe(HostsVulnerabilityScoreTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Hosts by Vulnerability Score',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(
      <HostsVulnerabilityScoreTableDisplay height={200} width={200} />,
    );

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
