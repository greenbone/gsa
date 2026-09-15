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
import HostsTopologyDisplay from 'web/pages/hosts/dashboard/HostsTopologyDisplay';

const loaderData = [
  {
    id: 'host-1',
    name: 'Host One',
    severity: 7.5,
    details: {traceroute: {value: 'Host One,Router One,Gateway One'}},
  },
];

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

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

vi.mock('web/components/chart/HostsTopologyChart', () => ({
  MAX_HOSTS: 1000,
  default: ({data, severityRating}) => (
    <div data-testid="mock-topology-chart">
      <span data-testid="severity-rating">{severityRating}</span>
      <span data-testid="host-count">{data?.hosts?.length ?? 0}</span>
      <span data-testid="link-count">{data?.links?.length ?? 0}</span>
      {data?.hosts?.map(host => (
        <span key={host.id} data-testid={`host-${host.id}`}>
          {host.name}
        </span>
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
    get: testing.fn().mockResolvedValue({data: loaderData}),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const gmp = createGmp();
  const {render} = rendererWith({gmp});

  return {
    gmp,
    ...render(
      <SubscriptionContext.Provider value={subscribe}>
        {component}
      </SubscriptionContext.Provider>,
    ),
  };
};

describe('HostsTopologyDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(HostsTopologyDisplay).toBeDefined();
    expect(typeof HostsTopologyDisplay).toBe('function');
    expect(HostsTopologyDisplay.displayId).toBe('host-by-topology');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(HostsTopologyDisplay.displayId);

    expect(registered?.component).toBe(HostsTopologyDisplay);
    expect(String(registered?.title)).toBe('Chart: Hosts Topology');
  });

  test('should load and render the transformed topology data', async () => {
    const {gmp} = renderDisplay(
      <HostsTopologyDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Hosts Topology');
      expect(screen.getByTestId('severity-rating')).toHaveTextContent('CVSSv3');
      expect(screen.getByTestId('host-count')).toHaveTextContent('3');
      expect(screen.getByTestId('link-count')).toHaveTextContent('2');
      expect(screen.getByTestId('host-Host One')).toHaveTextContent('Host One');
      expect(screen.getByTestId('host-Router One')).toHaveTextContent(
        'Router One',
      );
      expect(screen.getByTestId('host-Gateway One')).toHaveTextContent(
        'Gateway One',
      );
      expect(gmp.hosts.get).toHaveBeenCalledWith(
        expect.objectContaining({filter: expect.anything()}),
      );
    });
  });
});
