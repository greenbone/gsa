/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  OperatingSystemCvssDisplay,
  OperatingSystemCvssTableDisplay,
} from 'web/pages/operatingsystems/dashboard/OperatingSystemCvssDisplay';
import {
  OperatingSystemSeverityClassDisplay,
  OperatingSystemSeverityClassTableDisplay,
} from 'web/pages/operatingsystems/dashboard/OperatingSystemSeverityClassDisplay';
import {
  OperatingSystemVulnerabilityScoreDisplay,
  OsVulnScoreTableDisplay,
} from 'web/pages/operatingsystems/dashboard/OperatingSystemVulnerabilityScoreDisplay';

export const OS_DASHBOARD_ID = 'e93b51ed-5881-40e0-bc4f-7d3268a36177';

export const OS_DISPLAYS = [
  OperatingSystemCvssDisplay.displayId,
  OperatingSystemCvssTableDisplay.displayId,
  OperatingSystemSeverityClassDisplay.displayId,
  OperatingSystemSeverityClassTableDisplay.displayId,
  OperatingSystemVulnerabilityScoreDisplay.displayId,
  OsVulnScoreTableDisplay.displayId,
];

const OsDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        OperatingSystemSeverityClassDisplay.displayId,
        OperatingSystemVulnerabilityScoreDisplay.displayId,
        OperatingSystemCvssDisplay.displayId,
      ],
    ]}
    id={OS_DASHBOARD_ID}
    permittedDisplays={OS_DISPLAYS}
  />
);

export default OsDashboard;
