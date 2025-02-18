/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {ReportsCvssDisplay, ReportsCvssTableDisplay} from './CvssDisplay';
import {
  ReportsHighResultsDisplay,
  ReportsHighResultsTableDisplay,
} from './HighResultsDisplay';
import {
  ReportsSeverityDisplay,
  ReportsSeverityTableDisplay,
} from './SeverityClassDisplay';
import Dashboard from '../../../components/dashboard/Dashboard';

export const REPORTS_DASHBOARD_ID = 'e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071';

export const REPORTS_DISPLAYS = [
  ReportsCvssDisplay.displayId,
  ReportsHighResultsDisplay.displayId,
  ReportsSeverityDisplay.displayId,
  ReportsCvssTableDisplay.displayId,
  ReportsHighResultsTableDisplay.displayId,
  ReportsSeverityTableDisplay.displayId,
];

const ReportsDashboard = props => (
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
