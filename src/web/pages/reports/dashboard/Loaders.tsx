/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const REPORTS_HIGH_RESULTS = 'reports-high-results';
export const REPORTS_SEVERITY = 'reports-severity';

export const reportsSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.reports.getSeverityAggregates({filter}).then(r => r.data),
  REPORTS_SEVERITY,
);

export const ReportsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={REPORTS_SEVERITY}
    filter={filter}
    load={reportsSeverityLoadFunc}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

export const reportsHighResultsLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.reports.getHighResultsAggregates({filter}).then(r => r.data),
  REPORTS_HIGH_RESULTS,
);

export const ReportsHighResultsLoader = ({filter, children}) => (
  <Loader
    dataId={REPORTS_HIGH_RESULTS}
    filter={filter}
    load={reportsHighResultsLoadFunc}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);
