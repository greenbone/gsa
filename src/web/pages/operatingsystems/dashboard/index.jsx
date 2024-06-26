/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {OsCvssDisplay, OsCvssTableDisplay} from './cvssdisplay';
import {
  OsSeverityClassDisplay,
  OsSeverityClassTableDisplay,
} from './severityclassdisplay';
import {OsVulnScoreDisplay, OsVulnScoreTableDisplay} from './vulnscoredisplay';

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
    id={OS_DASHBOARD_ID}
    permittedDisplays={OS_DISPLAYS}
    defaultDisplays={[
      [
        OsSeverityClassDisplay.displayId,
        OsVulnScoreDisplay.displayId,
        OsCvssDisplay.displayId,
      ],
    ]}
  />
);

export default OsDashboard;

// vim: set ts=2 sw=2 tw=80:
