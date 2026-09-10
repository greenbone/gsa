/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type AggregatesResponseData} from 'gmp/commands/entities';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import {type SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

export const VULNS_SEVERITY = 'vulns-severity';
export const VULNS_HOSTS = 'vulns-hosts';

const vulnerabilitiesSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.vulns.getSeverityAggregates({filter}).then(r => r.data),
  VULNS_SEVERITY,
);

export const VulnerabilitiesSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={VULNS_SEVERITY}
    filter={filter}
    load={vulnerabilitiesSeverityLoadFunc}
    subscriptions={['vulns.timer', 'vulns.changed']}
  >
    {children}
  </Loader>
);

const vulnerabilitiesHostsLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.vulns.getHostAggregates({filter}).then(r => r.data),
  VULNS_HOSTS,
);

export const VulnerabilitiesHostsLoader = ({
  filter,
  children,
}: DisplayLoaderProps<AggregatesResponseData>) => (
  <Loader
    dataId={VULNS_HOSTS}
    filter={filter}
    load={vulnerabilitiesHostsLoadFunc}
    subscriptions={['vulns.timer', 'vulns.changed']}
  >
    {children}
  </Loader>
);
