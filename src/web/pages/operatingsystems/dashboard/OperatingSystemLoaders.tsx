/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CvssData} from 'web/components/dashboard/display/cvss/cvss-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';

interface OperatingSystemVulnerabilityGroup {
  value: string;
  text: {
    hosts: string;
    modified: string;
    name: string;
  };
  stats?: {
    average_severity?: {
      mean: number;
    };
    average_severity_score?: {
      max: number;
    };
  };
}

export interface OperatingSystemVulnerabilityScoreData {
  groups?: OperatingSystemVulnerabilityGroup[];
}

export const OSS_SEVERITY = 'oss-severity';
export const OSS_VULN_SCORE = 'oss-most-vulnerable';
const OSS_MAX_GROUPS = 10;

const operatingSystemAverageSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.operatingsystems
      .getAverageSeverityAggregates({filter})
      .then(r => r.data),
  OSS_SEVERITY,
);

export const OperatingSystemAverageSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CvssData>) => (
  <Loader
    dataId={OSS_SEVERITY}
    filter={filter}
    load={operatingSystemAverageSeverityLoadFunc}
    subscriptions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);

const operatingSystemVulnerabilityScoreLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.operatingsystems
      .getVulnScoreAggregates({filter, max: OSS_MAX_GROUPS})
      .then(r => r.data),
  OSS_VULN_SCORE,
);

export const OperatingSystemVulnerabilityScoreLoader = ({
  children,
  filter,
}: DisplayLoaderProps<OperatingSystemVulnerabilityScoreData>) => (
  <Loader
    dataId={OSS_VULN_SCORE}
    filter={filter}
    load={operatingSystemVulnerabilityScoreLoadFunc}
    subscriptions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);
