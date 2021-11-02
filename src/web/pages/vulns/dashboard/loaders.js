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

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const VULNS_SEVERITY = 'vulns-severity';
export const VULNS_HOSTS = 'vulns-hosts';

export const vulnsSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.vulns.getSeverityAggregates({filter}).then(r => r.data),
  VULNS_SEVERITY,
);

export const VulnsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={VULNS_SEVERITY}
    filter={filter}
    load={vulnsSeverityLoader}
    subscriptions={['vulns.timer', 'vulns.changed']}
  >
    {children}
  </Loader>
);

VulnsSeverityLoader.propTypes = loaderPropTypes;

export const vulnsHostsLoader = loadFunc(
  ({gmp, filter}) => gmp.vulns.getHostAggregates({filter}).then(r => r.data),
  VULNS_HOSTS,
);

export const VulnsHostsLoader = ({filter, children}) => (
  <Loader
    dataId={VULNS_HOSTS}
    filter={filter}
    load={vulnsHostsLoader}
    subscriptions={['vulns.timer', 'vulns.changed']}
  >
    {children}
  </Loader>
);

VulnsHostsLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
