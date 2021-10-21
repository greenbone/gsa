/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import Filter from 'gmp/models/filter';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

import {MAX_HOSTS} from 'web/components/chart/topology';

export const HOSTS_MODIFIED = 'hosts-modified';
export const HOSTS_SEVERITY = 'hosts-severity';
export const HOSTS_TOPOLOGY = 'hosts-topology';
export const HOSTS_VULN_SCORE = 'hosts-vuln-score';

const HOSTS_MAX_GROUPS = 10;

const DEFAULT_TOPOLOGY_FILTER = Filter.fromString('rows=' + MAX_HOSTS);

export const hostsModifiedLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.hosts.getModifiedAggregates({filter}).then(r => r.data),
  HOSTS_MODIFIED,
);

export const HostsModifiedLoader = ({filter, children}) => (
  <Loader
    dataId={HOSTS_MODIFIED}
    filter={filter}
    load={hostsModifiedLoader}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

HostsModifiedLoader.propTypes = loaderPropTypes;

export const hostsSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.hosts.getSeverityAggregates({filter}).then(r => r.data),
  HOSTS_SEVERITY,
);

export const HostsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={HOSTS_SEVERITY}
    filter={filter}
    load={hostsSeverityLoader}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

HostsSeverityLoader.propTypes = loaderPropTypes;

export const hostsTopologyLoader = loadFunc(({gmp, filter}) => {
  filter = isDefined(filter)
    ? filter.copy().set('rows', MAX_HOSTS)
    : DEFAULT_TOPOLOGY_FILTER;
  return gmp.hosts.get({filter}).then(r => r.data);
}, HOSTS_TOPOLOGY);

export const HostsTopologyLoader = ({filter, children}) => (
  <Loader
    dataId={HOSTS_TOPOLOGY}
    filter={filter}
    load={hostsTopologyLoader}
    subscriptions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

HostsTopologyLoader.propTypes = loaderPropTypes;

export const hostsVulnScoreLoader = loadFunc(
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
    load={hostsVulnScoreLoader}
    subscripions={['hosts.timer', 'hosts.changed']}
  >
    {children}
  </Loader>
);

HostsVulnScoreLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
