/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
