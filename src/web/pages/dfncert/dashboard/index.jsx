/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  DfnCertsCreatedDisplay,
  DfnCertsCreatedTableDisplay,
} from 'web/pages/dfncert/dashboard/CreatedDisplay';
import {DfnCertCvssDisplay, DfnCertCvssTableDisplay} from 'web/pages/dfncert/dashboard/CvssDisplay';
import {
  DfnCertSeverityClassDisplay,
  DfnCertSeverityClassTableDisplay,
} from 'web/pages/dfncert/dashboard/SeverityClassDisplay';

export const DFNCERT_DASHBOARD_ID = '9812ea49-682d-4f99-b3cc-eca051d1ce59';

export const DFNCERT_DISPLAYS = [
  DfnCertsCreatedDisplay.displayId,
  DfnCertsCreatedTableDisplay.displayId,
  DfnCertCvssDisplay.displayId,
  DfnCertCvssTableDisplay.displayId,
  DfnCertSeverityClassDisplay.displayId,
  DfnCertSeverityClassTableDisplay.displayId,
];

const DfnCertDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        DfnCertSeverityClassDisplay.displayId,
        DfnCertsCreatedDisplay.displayId,
        DfnCertCvssDisplay.displayId,
      ],
    ]}
    id={DFNCERT_DASHBOARD_ID}
    permittedDisplays={DFNCERT_DISPLAYS}
  />
);

export default DfnCertDashboard;
