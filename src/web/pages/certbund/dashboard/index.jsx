/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  CertBundCreatedDisplay,
  CertBundCreatedTableDisplay,
} from 'web/pages/certbund/dashboard/CreatedDisplay';
import {
  CertBundCvssDisplay,
  CertBundCvssTableDisplay,
} from 'web/pages/certbund/dashboard/CvssDisplay';
import {
  CertBundSeverityClassDisplay,
  CertBundSeverityClassTableDisplay,
} from 'web/pages/certbund/dashboard/SeverityClassDisplay';

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
    defaultDisplays={[
      [
        CertBundSeverityClassDisplay.displayId,
        CertBundCreatedDisplay.displayId,
        CertBundCvssDisplay.displayId,
      ],
    ]}
    id={CERTBUND_DASHBOARD_ID}
    permittedDisplays={CERTBUND_DISPLAYS}
  />
);

export default CertBundDashboard;
