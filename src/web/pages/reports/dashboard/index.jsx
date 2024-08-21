/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {ReportsCvssDisplay, ReportsCvssTableDisplay} from './cvssdisplay';
import {
  ReportsSeverityDisplay,
  ReportsSeverityTableDisplay,
} from './severityclassdisplay';
import {
  ReportsHighResultsDisplay,
  ReportsHighResultsTableDisplay,
} from './highresultsdisplay';

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
    id={REPORTS_DASHBOARD_ID}
    permittedDisplays={REPORTS_DISPLAYS}
    defaultDisplays={[
      [
        ReportsSeverityDisplay.displayId,
        ReportsHighResultsDisplay.displayId,
        ReportsCvssDisplay.displayId,
      ],
    ]}
  />
);

export default ReportsDashboard;

// vim: set ts=2 sw=2 tw=80:
