/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import type Gmp from 'gmp/gmp';
import {type default as FilterType} from 'gmp/models/filter/filter-type';
import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

interface VulnerabilitiesLoaderProps {
  filter?: FilterType;
  children: (props: {data: unknown; isLoading: boolean}) => React.ReactNode;
}

export const VULNS_SEVERITY = 'vulns-severity';
export const VULNS_HOSTS = 'vulns-hosts';

export const vulnerabilitiesSeverityLoader = loadFunc(
  ({gmp, filter}: {gmp: Gmp; filter: FilterType}) =>
    gmp.vulns.getSeverityAggregates({filter}).then(r => r.data),
  VULNS_SEVERITY,
);

export const VulnerabilitiesSeverityLoader = ({
  filter,
  children,
}: VulnerabilitiesLoaderProps) => (
  <Loader
    dataId={VULNS_SEVERITY}
    filter={filter}
    load={vulnerabilitiesSeverityLoader}
    subscriptions={['vulns.timer', 'vulns.changed']}
  >
    {children}
  </Loader>
);

VulnerabilitiesSeverityLoader.propTypes = loaderPropTypes;

export const vulnerabilitiesHostsLoader = loadFunc(
  ({gmp, filter}: {gmp: Gmp; filter: FilterType}) =>
    gmp.vulns.getHostAggregates({filter}).then(r => r.data),
  VULNS_HOSTS,
);

export const VulnerabilitiesHostsLoader = ({
  filter,
  children,
}: VulnerabilitiesLoaderProps) => (
  <Loader
    dataId={VULNS_HOSTS}
    filter={filter}
    load={vulnerabilitiesHostsLoader}
    subscriptions={['vulns.timer', 'vulns.changed']}
  >
    {children}
  </Loader>
);

VulnerabilitiesHostsLoader.propTypes = loaderPropTypes;
