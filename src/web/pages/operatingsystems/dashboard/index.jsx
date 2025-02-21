/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {OsCvssDisplay, OsCvssTableDisplay} from './CvssDisplay';
import {
  OsSeverityClassDisplay,
  OsSeverityClassTableDisplay,
} from './SeverityClassDisplay';
import {OsVulnScoreDisplay, OsVulnScoreTableDisplay} from './VulnScoreDisplay';
import Dashboard from '../../../components/dashboard/Dashboard';

export const OS_DASHBOARD_ID = 'e93b51ed-5881-40e0-bc4f-7d3268a36177';

export const OS_DISPLAYS = [
  OsCvssDisplay.displayId,
  OsCvssTableDisplay.displayId,
  OsSeverityClassDisplay.displayId,
  OsSeverityClassTableDisplay.displayId,
  OsVulnScoreDisplay.displayId,
  OsVulnScoreTableDisplay.displayId,
];

const OsDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        OsSeverityClassDisplay.displayId,
        OsVulnScoreDisplay.displayId,
        OsCvssDisplay.displayId,
      ],
    ]}
    id={OS_DASHBOARD_ID}
    permittedDisplays={OS_DISPLAYS}
  />
);

export default OsDashboard;
