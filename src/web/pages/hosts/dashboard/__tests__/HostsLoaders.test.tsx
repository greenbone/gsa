/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  HOSTS_MODIFIED,
  HOSTS_SEVERITY,
  HOSTS_TOPOLOGY,
  HOSTS_VULN_SCORE,
  HostsModifiedLoader,
  HostsSeverityLoader,
  HostsTopologyLoader,
  HostsVulnScoreLoader,
} from 'web/pages/hosts/dashboard/HostsLoaders';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';

const createGmp = (hosts: Record<string, unknown>) => ({hosts});

const renderWithSubscriptionContext = ({
  gmp,
  subscribe,
  children,
}: {
  gmp: Record<string, unknown>;
  subscribe: SubscribeFunc;
  children: ReactElement;
}) => {
  const {render} = rendererWith({gmp, store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {children}
    </SubscriptionContext.Provider>,
  );
};

describe('Hosts loaders', () => {
  test('should export the host data IDs', () => {
    expect(HOSTS_MODIFIED).toBe('hosts-modified');
    expect(HOSTS_SEVERITY).toBe('hosts-severity');
    expect(HOSTS_TOPOLOGY).toBe('hosts-topology');
    expect(HOSTS_VULN_SCORE).toBe('hosts-vuln-score');
  });

  test('should load modified aggregates and render them', async () => {
    const data = {groups: [{value: '2026-01-01', count: 5, c_count: 10}]};
    const getModifiedAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getModifiedAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <HostsModifiedLoader filter={filter}>{children}</HostsModifiedLoader>
      ),
    });

    await waitFor(() => {
      expect(getModifiedAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('hosts.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'hosts.changed',
      expect.any(Function),
    );
  });

  test('should load severity aggregates and render them', async () => {
    const data = {groups: [{value: '5.0', count: 10}]};
    const getSeverityAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getSeverityAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <HostsSeverityLoader filter={filter}>{children}</HostsSeverityLoader>
      ),
    });

    await waitFor(() => {
      expect(getSeverityAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('hosts.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'hosts.changed',
      expect.any(Function),
    );
  });

  test('should limit topology data to the maximum number of hosts', async () => {
    const data = [{id: 'host-1', name: 'Host One'}];
    const get = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({get});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <HostsTopologyLoader filter={filter}>{children}</HostsTopologyLoader>
      ),
    });

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith({
        filter: QueryFilter.fromString('first=1 rows=1000'),
      });
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('hosts.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'hosts.changed',
      expect.any(Function),
    );
  });

  test('should load vulnerability score aggregates with the maximum groups', async () => {
    const data = {groups: []};
    const getVulnScoreAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getVulnScoreAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <HostsVulnScoreLoader filter={filter}>{children}</HostsVulnScoreLoader>
      ),
    });

    await waitFor(() => {
      expect(getVulnScoreAggregates).toHaveBeenCalledWith({filter, max: 10});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('hosts.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'hosts.changed',
      expect.any(Function),
    );
  });
});
