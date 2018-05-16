/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import PropTypes from '../../../utils/proptypes';

import Dashboard from '../../../components/dashboard2/dashboard';

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

const OvaldefDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={OVALDEF_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={[
      OvaldefClassDisplay.displayId,
      OvaldefClassTableDisplay.displayId,
      OvaldefsCreatedDisplay.displayId,
      OvaldefsCreatedTableDisplay.displayId,
      OvaldefCvssDisplay.displayId,
      OvaldefCvssTableDisplay.displayId,
      OvaldefSeverityClassDisplay.displayId,
      OvaldefSeverityClassTableDisplay.displayId,
    ]}
    defaultContent={[
      [
        OvaldefSeverityClassDisplay.displayId,
        OvaldefsCreatedDisplay.displayId,
        OvaldefClassDisplay.displayId,
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

OvaldefDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default OvaldefDashboard;

// vim: set ts=2 sw=2 tw=80:
