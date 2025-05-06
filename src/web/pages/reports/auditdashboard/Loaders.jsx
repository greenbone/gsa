/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const REPORTS_COMPLIANCE = 'reports-compliance';

export const reportComplianceLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.auditreports.getComplianceAggregates({filter}).then(r => r.data),
  REPORTS_COMPLIANCE,
);

export const ReportCompianceLoader = ({children, filter}) => (
  <Loader
    dataId={REPORTS_COMPLIANCE}
    filter={filter}
    load={reportComplianceLoader}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

ReportCompianceLoader.propTypes = loaderPropTypes;
