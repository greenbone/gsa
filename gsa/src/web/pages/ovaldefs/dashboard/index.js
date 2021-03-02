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

import {OvaldefClassDisplay, OvaldefClassTableDisplay} from './classdisplay';
import {
  OvaldefsCreatedDisplay,
  OvaldefsCreatedTableDisplay,
} from './createddisplay';
import {OvaldefCvssDisplay, OvaldefCvssTableDisplay} from './cvssdisplay';
import {
  OvaldefSeverityClassDisplay,
  OvaldefSeverityClassTableDisplay,
} from './severityclassdisplay';

export const OVALDEF_DASHBOARD_ID = '9563efc0-9f4e-4d1f-8f8d-0205e32b90a4';

export const OVALDEF_DISPLAYS = [
  OvaldefClassDisplay.displayId,
  OvaldefClassTableDisplay.displayId,
  OvaldefsCreatedDisplay.displayId,
  OvaldefsCreatedTableDisplay.displayId,
  OvaldefCvssDisplay.displayId,
  OvaldefCvssTableDisplay.displayId,
  OvaldefSeverityClassDisplay.displayId,
  OvaldefSeverityClassTableDisplay.displayId,
];

const OvaldefDashboard = props => (
  <Dashboard
    {...props}
    id={OVALDEF_DASHBOARD_ID}
    permittedDisplays={OVALDEF_DISPLAYS}
    defaultDisplays={[
      [
        OvaldefSeverityClassDisplay.displayId,
        OvaldefsCreatedDisplay.displayId,
        OvaldefClassDisplay.displayId,
      ],
    ]}
  />
);

export default OvaldefDashboard;

// vim: set ts=2 sw=2 tw=80:
