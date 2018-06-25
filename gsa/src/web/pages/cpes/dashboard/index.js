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

import Dashboard from '../../../components/dashboard/dashboard';

import {CpesCreatedDisplay, CpesCreatedTableDisplay} from './createddisplay';
import {CpesCvssDisplay, CpesCvssTableDisplay} from './cvssdisplay';
import {
  CpesSeverityClassDisplay,
  CpesSeverityClassTableDisplay,
} from './severityclassdisplay';

export const CPES_DASHBOARD_ID = '9cff9b4d-b164-43ce-8687-f2360afc7500';

export const CPES_DISPLAYS = [
  CpesCreatedDisplay.displayId,
  CpesCreatedTableDisplay.displayId,
  CpesCvssDisplay.displayId,
  CpesCvssTableDisplay.displayId,
  CpesSeverityClassDisplay.displayId,
  CpesSeverityClassTableDisplay.displayId,
];

const CpesDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={CPES_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={CPES_DISPLAYS}
    defaultContent={[
      [
        CpesSeverityClassDisplay.displayId,
        CpesCreatedDisplay.displayId,
        CpesCvssDisplay.displayId,
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

CpesDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default CpesDashboard;

// vim: set ts=2 sw=2 tw=80:
