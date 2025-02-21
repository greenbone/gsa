/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {
  OverridesActiveDaysDisplay,
  OverridesActiveDaysTableDisplay,
} from './ActiveDaysDisplay';
import {
  OverridesCreatedDisplay,
  OverridesCreatedTableDisplay,
} from './CreatedDisplay';
import {
  OverridesWordCloudDisplay,
  OverridesWordCloudTableDisplay,
} from './WordCloudDisplay';
import Dashboard from '../../../components/dashboard/Dashboard';

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
    defaultDisplays={[
      [
        OverridesActiveDaysDisplay.displayId,
        OverridesCreatedDisplay.displayId,
        OverridesWordCloudDisplay.displayId,
      ],
    ]}
    id={OVERRIDES_DASHBOARD_ID}
    permittedDisplays={OVERRIDES_DISPLAYS}
  />
);

export default OverridesDashboard;
