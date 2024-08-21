/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {NvtsCvssDisplay, NvtsCvssTableDisplay} from './cvssdisplay';
import {NvtsFamilyDisplay, NvtsFamilyTableDisplay} from './familydisplay';
import {
  NvtsSeverityClassDisplay,
  NvtsSeverityClassTableDisplay,
} from './severityclassdisplay';
import {NvtsQodDisplay, NvtsQodTableDisplay} from './qoddisplay';
import {NvtsQodTypeDisplay, NvtsQodTypeTableDisplay} from './qodtypedisplay';
import {NvtsCreatedDisplay, NvtsCreatedTableDisplay} from './createddisplay';

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
    id={NVTS_DASHBOARD_ID}
    permittedDisplays={NVTS_DISPLAYS}
    defaultDisplays={[
      [
        NvtsSeverityClassDisplay.displayId,
        NvtsCreatedDisplay.displayId,
        NvtsFamilyDisplay.displayId,
      ],
    ]}
  />
);

export default NvtsDashboard;

// vim: set ts=2 sw=2 tw=80:
