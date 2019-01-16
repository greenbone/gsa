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

import {
  OverridesActiveDaysDisplay,
  OverridesActiveDaysTableDisplay,
} from './activedaysdisplay';
import {
  OverridesCreatedDisplay,
  OverridesCreatedTableDisplay,
} from './createddisplay';
import {
  OverridesWordCloudDisplay,
  OverridesWordCloudTableDisplay,
} from './wordclouddisplay';

export const OVERRIDES_DASHBOARD_ID = '054862fe-0781-4527-b1aa-2113bcd16ce7';

export const OVERRIDES_DISPLAYS = [
  OverridesActiveDaysDisplay.displayId,
  OverridesCreatedDisplay.displayId,
  OverridesWordCloudDisplay.displayId,
  OverridesActiveDaysTableDisplay.displayId,
  OverridesCreatedTableDisplay.displayId,
  OverridesWordCloudTableDisplay.displayId,
];

const OverridesDashboard = props => (
  <Dashboard
    {...props}
    id={OVERRIDES_DASHBOARD_ID}
    permittedDisplays={OVERRIDES_DISPLAYS}
    defaultDisplays={[
      [
        OverridesActiveDaysDisplay.displayId,
        OverridesCreatedDisplay.displayId,
        OverridesWordCloudDisplay.displayId,
      ],
    ]}
  />
);

export default OverridesDashboard;

// vim: set ts=2 sw=2 tw=80:
