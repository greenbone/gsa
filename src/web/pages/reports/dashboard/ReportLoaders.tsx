/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import {type SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

interface ReportHighResultsGroup {
  value: string;
  stats: {
    high: {
      max: number;
    };
    high_per_host: {
      max: number;
    };
  };
}

export interface ReportHighResultsData {
  groups?: ReportHighResultsGroup[];
}

export const REPORTS_HIGH_RESULTS = 'reports-high-results';
export const REPORTS_SEVERITY = 'reports-severity';

const reportsSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.reports.getSeverityAggregates({filter}).then(r => r.data),
  REPORTS_SEVERITY,
);

export const ReportsSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={REPORTS_SEVERITY}
    filter={filter}
    load={reportsSeverityLoadFunc}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

const reportsHighResultsLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.reports.getHighResultsAggregates({filter}).then(r => r.data),
  REPORTS_HIGH_RESULTS,
);

export const ReportsHighResultsLoader = ({
  filter,
  children,
}: DisplayLoaderProps<ReportHighResultsData>) => (
  <Loader
    dataId={REPORTS_HIGH_RESULTS}
    filter={filter}
    load={reportsHighResultsLoadFunc}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);
