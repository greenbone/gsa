/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {OsCvssDisplay, OsCvssTableDisplay} from 'web/pages/operatingsystems/dashboard/CvssDisplay';
import {
  OsSeverityClassDisplay,
  OsSeverityClassTableDisplay,
} from 'web/pages/operatingsystems/dashboard/SeverityClassDisplay';
import {OsVulnScoreDisplay, OsVulnScoreTableDisplay} from 'web/pages/operatingsystems/dashboard/VulnScoreDisplay';

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
