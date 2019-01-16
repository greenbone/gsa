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
  SecInfosCreatedDisplay,
  SecInfosCreatedTableDisplay,
} from './createddisplay';
import {SecInfosCvssDisplay, SecInfosCvssTableDisplay} from './cvssdisplay';
import {
  SecInfosSeverityClassDisplay,
  SecInfosSeverityClassTableDisplay,
} from './severityclassdisplay';
import {SecInfosTypeDisplay, SecInfosTypeTableDisplay} from './typedisplay';

export const SECINFO_DASHBOARD_ID = '4c7b1ea7-b7e6-4d12-9791-eb9f72b6f864';

export const SECINFO_DISPLAYS = [
  SecInfosCreatedDisplay.displayId,
  SecInfosCreatedTableDisplay.displayId,
  SecInfosCvssDisplay.displayId,
  SecInfosCvssTableDisplay.displayId,
  SecInfosSeverityClassDisplay.displayId,
  SecInfosSeverityClassTableDisplay.displayId,
  SecInfosTypeDisplay.displayId,
  SecInfosTypeTableDisplay.displayId,
];

export const SecInfoDashboard = props => (
  <Dashboard
    {...props}
    id={SECINFO_DASHBOARD_ID}
    permittedDisplays={SECINFO_DISPLAYS}
    defaultDisplays={[
      [
        SecInfosSeverityClassDisplay.displayId,
        SecInfosCreatedDisplay.displayId,
        SecInfosCvssDisplay.displayId,
      ],
    ]}
  />
);

// vim: set ts=2 sw=2 tw=80:
