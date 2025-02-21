/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {NvtsCreatedDisplay, NvtsCreatedTableDisplay} from './CreatedDisplay';
import {NvtsCvssDisplay, NvtsCvssTableDisplay} from './CvssDisplay';
import {NvtsFamilyDisplay, NvtsFamilyTableDisplay} from './FamilyDisplay';
import {NvtsQodDisplay, NvtsQodTableDisplay} from './QodDisplay';
import {NvtsQodTypeDisplay, NvtsQodTypeTableDisplay} from './QodTypeDisplay';
import {
  NvtsSeverityClassDisplay,
  NvtsSeverityClassTableDisplay,
} from './SeverityClassDisplay';
import Dashboard from '../../../components/dashboard/Dashboard';

export const NVTS_DASHBOARD_ID = 'f68d9369-1945-477b-968f-121c6029971b';

export const NVTS_DISPLAYS = [
  NvtsCvssDisplay.displayId,
  NvtsFamilyDisplay.displayId,
  NvtsSeverityClassDisplay.displayId,
  NvtsQodDisplay.displayId,
  NvtsQodTypeDisplay.displayId,
  NvtsCreatedDisplay.displayId,
  NvtsCvssTableDisplay.displayId,
  NvtsSeverityClassTableDisplay.displayId,
  NvtsFamilyTableDisplay.displayId,
  NvtsCreatedTableDisplay.displayId,
  NvtsQodTableDisplay.displayId,
  NvtsQodTypeTableDisplay.displayId,
];

const NvtsDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        NvtsSeverityClassDisplay.displayId,
        NvtsCreatedDisplay.displayId,
        NvtsFamilyDisplay.displayId,
      ],
    ]}
    id={NVTS_DASHBOARD_ID}
    permittedDisplays={NVTS_DISPLAYS}
  />
);

export default NvtsDashboard;
