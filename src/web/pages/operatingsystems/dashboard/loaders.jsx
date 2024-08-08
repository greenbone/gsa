/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const OSS_SEVERITY = 'oss-severity';
export const OSS_VULN_SCORE = 'oss-most-vulnerable';
const OSS_MAX_GROUPS = 10;

export const osAverageSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.operatingsystems
      .getAverageSeverityAggregates({filter})
      .then(r => r.data),
  OSS_SEVERITY,
);

export const OsAverageSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={OSS_SEVERITY}
    filter={filter}
    load={osAverageSeverityLoader}
    subscriptions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);

OsAverageSeverityLoader.propTypes = loaderPropTypes;

export const osVulnScoreLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.operatingsystems
      .getVulnScoreAggregates({filter, max: OSS_MAX_GROUPS})
      .then(r => r.data),
  OSS_VULN_SCORE,
);

export const OsVulnScoreLoader = ({children, filter}) => (
  <Loader
    dataId={OSS_VULN_SCORE}
    filter={filter}
    load={osVulnScoreLoader}
    subscripions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);

OsVulnScoreLoader.propTypes = loaderPropTypes;
