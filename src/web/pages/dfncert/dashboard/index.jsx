/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {
  DfnCertsCreatedDisplay,
  DfnCertsCreatedTableDisplay,
} from './createddisplay';
import {DfnCertCvssDisplay, DfnCertCvssTableDisplay} from './cvssdisplay';
import {
  DfnCertSeverityClassDisplay,
  DfnCertSeverityClassTableDisplay,
} from './severityclassdisplay';

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
    id={DFNCERT_DASHBOARD_ID}
    permittedDisplays={DFNCERT_DISPLAYS}
    defaultDisplays={[
      [
        DfnCertSeverityClassDisplay.displayId,
        DfnCertsCreatedDisplay.displayId,
        DfnCertCvssDisplay.displayId,
      ],
    ]}
  />
);

export default DfnCertDashboard;

// vim: set ts=2 sw=2 tw=80:
