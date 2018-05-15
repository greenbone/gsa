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

import {NvtsCvssDisplay, NvtsCvssTableDisplay} from './cvssdisplay';
import {NvtsFamilyDisplay, NvtsFamilyTableDisplay} from './familydisplay';
import {
  NvtsSeverityDisplay,
  NvtsSeverityTableDisplay,
} from './severityclassdisplay';
import {NvtsQodDisplay, NvtsQodTableDisplay} from './qoddisplay';
import {NvtsQodTypeDisplay, NvtsQodTypeTableDisplay} from './qodtypedisplay';
import {NvtsCreatedDisplay, NvtsCreatedTableDisplay} from './createddisplay';

export const NVTS_DASHBOARD_ID = 'f68d9369-1945-477b-968f-121c6029971b';

export const NVTS_DISPLAYS = [
  NvtsCvssDisplay.displayId,
  NvtsFamilyDisplay.displayId,
  NvtsSeverityDisplay.displayId,
  NvtsQodDisplay.displayId,
  NvtsQodTypeDisplay.displayId,
  NvtsCreatedDisplay.displayId,
  NvtsCvssTableDisplay.displayId,
  NvtsSeverityTableDisplay.displayId,
  NvtsFamilyTableDisplay.displayId,
  NvtsCreatedTableDisplay.displayId,
  NvtsQodTableDisplay.displayId,
  NvtsQodTypeTableDisplay.displayId,
];

const NvtsDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={NVTS_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={NVTS_DISPLAYS}
    defaultContent={[
      [
        NvtsSeverityDisplay.displayId,
        NvtsCreatedDisplay.displayId,
        NvtsFamilyDisplay.displayId,
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

NvtsDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default NvtsDashboard;

// vim: set ts=2 sw=2 tw=80:
