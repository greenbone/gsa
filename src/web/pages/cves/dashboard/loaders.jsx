/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const CVES_SEVERITY = 'cves-severity';
export const CVES_CREATED = 'cves-created';

export const cveCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.cves.getCreatedAggregates({filter}).then(r => r.data),
  CVES_CREATED,
);

export const CvesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CVES_CREATED}
    filter={filter}
    load={cveCreatedLoader}
    subscriptions={['cves.timer', 'cves.changed']}
  >
    {children}
  </Loader>
);

CvesCreatedLoader.propTypes = loaderPropTypes;

export const cveSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.cves.getSeverityAggregates({filter}).then(r => r.data),
  CVES_SEVERITY,
);

export const CvesSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CVES_SEVERITY}
    filter={filter}
    load={cveSeverityLoader}
    subscriptions={['cves.timer', 'cves.changed']}
  >
    {children}
  </Loader>
);

CvesSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
