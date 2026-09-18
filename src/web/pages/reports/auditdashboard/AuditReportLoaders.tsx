/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';

interface AuditReportStatusGroup {
  count: number;
  value: string;
}

export interface AuditReportStatusData {
  groups?: AuditReportStatusGroup[];
}

export const REPORTS_COMPLIANCE = 'reports-compliance';

const reportComplianceLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.auditreports.getComplianceAggregates({filter}).then(r => r.data),
  REPORTS_COMPLIANCE,
);

export const ReportComplianceLoader = ({
  children,
  filter,
}: DisplayLoaderProps<AuditReportStatusData>) => (
  <Loader
    dataId={REPORTS_COMPLIANCE}
    filter={filter}
    load={reportComplianceLoadFunc}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);
