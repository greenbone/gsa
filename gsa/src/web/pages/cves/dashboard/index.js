/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Dashboard from 'web/components/dashboard/dashboard';

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
