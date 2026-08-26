/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const REPORTS_COMPLIANCE = 'reports-compliance';

export const reportComplianceLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.auditreports.getComplianceAggregates({filter}).then(r => r.data),
  REPORTS_COMPLIANCE,
);

export const ReportComplianceLoader = ({children, filter}) => (
  <Loader
    dataId={REPORTS_COMPLIANCE}
    filter={filter}
    load={reportComplianceLoadFunc}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);
