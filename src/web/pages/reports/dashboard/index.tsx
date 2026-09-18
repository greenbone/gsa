/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type FilterType from 'gmp/models/filter/filter-type';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  ReportsCvssDisplay,
  ReportsCvssTableDisplay,
} from 'web/pages/reports/dashboard/ReportCvssDisplay';
import {
  ReportsHighResultsDisplay,
  ReportsHighResultsTableDisplay,
} from 'web/pages/reports/dashboard/ReportHighResultsDisplay';
import {
  ReportsSeverityDisplay,
  ReportsSeverityTableDisplay,
} from 'web/pages/reports/dashboard/ReportSeverityClassDisplay';

interface ReportsDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const REPORTS_DASHBOARD_ID = 'e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071';

export const REPORTS_DISPLAYS = [
  ReportsCvssDisplay.displayId,
  ReportsHighResultsDisplay.displayId,
  ReportsSeverityDisplay.displayId,
  ReportsCvssTableDisplay.displayId,
  ReportsHighResultsTableDisplay.displayId,
  ReportsSeverityTableDisplay.displayId,
];

const ReportsDashboard = (props: ReportsDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        ReportsSeverityDisplay.displayId,
        ReportsHighResultsDisplay.displayId,
        ReportsCvssDisplay.displayId,
      ],
    ]}
    id={REPORTS_DASHBOARD_ID}
    permittedDisplays={REPORTS_DISPLAYS}
  />
);

export default ReportsDashboard;
