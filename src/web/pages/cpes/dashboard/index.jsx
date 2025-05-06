/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  CpesCreatedDisplay,
  CpesCreatedTableDisplay,
} from 'web/pages/cpes/dashboard/CreatedDisplay';
import {
  CpesCvssDisplay,
  CpesCvssTableDisplay,
} from 'web/pages/cpes/dashboard/CvssDisplay';
import {
  CpesSeverityClassDisplay,
  CpesSeverityClassTableDisplay,
} from 'web/pages/cpes/dashboard/SeverityClassDisplay';

export const CPES_DASHBOARD_ID = '9cff9b4d-b164-43ce-8687-f2360afc7500';

export const CPES_DISPLAYS = [
  CpesCreatedDisplay.displayId,
  CpesCreatedTableDisplay.displayId,
  CpesCvssDisplay.displayId,
  CpesCvssTableDisplay.displayId,
  CpesSeverityClassDisplay.displayId,
  CpesSeverityClassTableDisplay.displayId,
];

const CpesDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        CpesSeverityClassDisplay.displayId,
        CpesCreatedDisplay.displayId,
        CpesCvssDisplay.displayId,
      ],
    ]}
    id={CPES_DASHBOARD_ID}
    permittedDisplays={CPES_DISPLAYS}
  />
);

export default CpesDashboard;
