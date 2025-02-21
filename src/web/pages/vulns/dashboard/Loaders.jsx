/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
