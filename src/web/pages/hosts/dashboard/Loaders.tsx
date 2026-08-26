/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import {MAX_HOSTS} from 'web/components/chart/HostsTopologyChart';
import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const HOSTS_MODIFIED = 'hosts-modified';
export const HOSTS_SEVERITY = 'hosts-severity';
export const HOSTS_TOPOLOGY = 'hosts-topology';
export const HOSTS_VULN_SCORE = 'hosts-vuln-score';

const HOSTS_MAX_GROUPS = 10;

const DEFAULT_TOPOLOGY_FILTER = QueryFilter.fromString(`rows=${MAX_HOSTS}`);

export const hostsModifiedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.hosts.getModifiedAggregates({filter}).then(r => r.data),
  HOSTS_MODIFIED,
);

export const HostsModifiedLoader = ({filter, children}) => (
  <Loader
    dataId={HOSTS_MODIFIED}
    filter={filter}
    load={hostsModifiedLoadFunc}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

export const hostsSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.hosts.getSeverityAggregates({filter}).then(r => r.data),
  HOSTS_SEVERITY,
);

export const HostsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={HOSTS_SEVERITY}
    filter={filter}
    load={hostsSeverityLoadFunc}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

export const hostsTopologyLoadFunc = createLoadFunc(async ({gmp, filter}) => {
  filter = isDefined(filter)
    ? filter.copy().set('rows', MAX_HOSTS)
    : DEFAULT_TOPOLOGY_FILTER;
  const r = await gmp.hosts.get({filter});
  return r.data;
}, HOSTS_TOPOLOGY);

export const HostsTopologyLoader = ({filter, children}) => (
  <Loader
    dataId={HOSTS_TOPOLOGY}
    filter={filter}
    load={hostsTopologyLoadFunc}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

export const hostsVulnScoreLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.hosts
      .getVulnScoreAggregates({filter, max: HOSTS_MAX_GROUPS})
      .then(r => r.data),
  HOSTS_VULN_SCORE,
);

export const HostsVulnScoreLoader = ({children, filter}) => (
  <Loader
    dataId={HOSTS_VULN_SCORE}
    filter={filter}
    load={hostsVulnScoreLoadFunc}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);
