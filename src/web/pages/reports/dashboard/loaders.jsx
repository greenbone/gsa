/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const REPORTS_HIGH_RESULTS = 'reports-high-results';
export const REPORTS_SEVERITY = 'reports-severity';

export const reportsSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.reports.getSeverityAggregates({filter}).then(r => r.data),
  REPORTS_SEVERITY,
);

export const ReportsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={REPORTS_SEVERITY}
    filter={filter}
    load={reportsSeverityLoader}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

ReportsSeverityLoader.propTypes = loaderPropTypes;

export const reportsHighResultsLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.reports.getHighResultsAggregates({filter}).then(r => r.data),
  REPORTS_HIGH_RESULTS,
);

export const ReportsHighResultsLoader = ({filter, children}) => (
  <Loader
    dataId={REPORTS_HIGH_RESULTS}
    filter={filter}
    load={reportsHighResultsLoader}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

ReportsHighResultsLoader.propTypes = loaderPropTypes;
