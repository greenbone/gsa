/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {
  CertBundCreatedDisplay,
  CertBundCreatedTableDisplay,
} from './createddisplay';
import {CertBundCvssDisplay, CertBundCvssTableDisplay} from './cvssdisplay';
import {
  CertBundSeverityClassDisplay,
  CertBundSeverityClassTableDisplay,
} from './severityclassdisplay';

export const CERTBUND_DASHBOARD_ID = 'a6946f44-480f-4f37-8a73-28a4cd5310c4';

export const CERTBUND_DISPLAYS = [
  CertBundCreatedDisplay.displayId,
  CertBundCreatedTableDisplay.displayId,
  CertBundCvssDisplay.displayId,
  CertBundCvssTableDisplay.displayId,
  CertBundSeverityClassDisplay.displayId,
  CertBundSeverityClassTableDisplay.displayId,
];

const CertBundDashboard = props => (
  <Dashboard
    {...props}
    id={CERTBUND_DASHBOARD_ID}
    permittedDisplays={CERTBUND_DISPLAYS}
    defaultDisplays={[
      [
        CertBundSeverityClassDisplay.displayId,
        CertBundCreatedDisplay.displayId,
        CertBundCvssDisplay.displayId,
      ],
    ]}
  />
);

export default CertBundDashboard;

// vim: set ts=2 sw=2 tw=80:
