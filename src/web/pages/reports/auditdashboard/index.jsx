/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import Dashboard from 'web/components/dashboard/dashboard';

import {
  ReportComplianceDisplay,
  ReportComplianceTableDisplay,
} from './statusdisplay';

export const AUDIT_REPORTS_DASHBOARD_ID =
  '8083d77b-05bb-4b17-ab39-c81175cb512c';

export const AUDIT_REPORTS_DISPLAYS = [
  ReportComplianceDisplay.displayId,
  ReportComplianceTableDisplay.displayId,
];

const AuditReportsDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        ReportComplianceDisplay.displayId,
        ReportComplianceTableDisplay.displayId,
      ],
    ]}
    id={AUDIT_REPORTS_DASHBOARD_ID}
    permittedDisplays={AUDIT_REPORTS_DISPLAYS}
  />
);

export default AuditReportsDashboard;