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

import {CvesCreatedDisplay, CvesCreatedTableDisplay} from './createddisplay';
import {CvesCvssDisplay, CvesCvssTableDisplay} from './cvssdisplay';
import {
  CvesSeverityClassDisplay,
  CvesSeverityClassTableDisplay,
} from './severityclassdisplay';

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
    id={CVES_DASHBOARD_ID}
    permittedDisplays={CVES_DISPLAYS}
    defaultDisplays={[
      [
        CvesSeverityClassDisplay.displayId,
        CvesCreatedDisplay.displayId,
        CvesCvssDisplay.displayId,
      ],
    ]}
  />
);

export default CvesDashboard;

// vim: set ts=2 sw=2 tw=80:
