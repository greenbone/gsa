/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
