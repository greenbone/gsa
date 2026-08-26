/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const OSS_SEVERITY = 'oss-severity';
export const OSS_VULN_SCORE = 'oss-most-vulnerable';
const OSS_MAX_GROUPS = 10;

export const osAverageSeverityLoadFunc = createLoadFunc(
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
    load={osAverageSeverityLoadFunc}
    subscriptions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);

export const osVulnScoreLoadFunc = createLoadFunc(
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
    load={osVulnScoreLoadFunc}
    subscriptions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);
