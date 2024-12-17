/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';


import {CvesCreatedDisplay, CvesCreatedTableDisplay} from './createddisplay';
import {CvesCvssDisplay, CvesCvssTableDisplay} from './cvssdisplay';
import {
  CvesSeverityClassDisplay,
  CvesSeverityClassTableDisplay,
} from './severityclassdisplay';
import Dashboard from '../../../components/dashboard/dashboard';

export const CVES_DASHBOARD_ID = '815ddd2e-8654-46c7-a05b-d73224102240';

export const CVES_DISPLAYS = [
  CvesCreatedDisplay.displayId,
  CvesCreatedTableDisplay.displayId,
  CvesCvssDisplay.displayId,
  CvesCvssTableDisplay.displayId,
  CvesSeverityClassDisplay.displayId,
  CvesSeverityClassTableDisplay.displayId,
];

const CvesDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        CvesSeverityClassDisplay.displayId,
        CvesCreatedDisplay.displayId,
        CvesCvssDisplay.displayId,
      ],
    ]}
    id={CVES_DASHBOARD_ID}
    permittedDisplays={CVES_DISPLAYS}
  />
);

export default CvesDashboard;

// vim: set ts=2 sw=2 tw=80:
