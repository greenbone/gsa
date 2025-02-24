/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  OverridesActiveDaysDisplay,
  OverridesActiveDaysTableDisplay,
} from 'web/pages/overrides/dashboard/ActiveDaysDisplay';
import {
  OverridesCreatedDisplay,
  OverridesCreatedTableDisplay,
} from 'web/pages/overrides/dashboard/CreatedDisplay';
import {
  OverridesWordCloudDisplay,
  OverridesWordCloudTableDisplay,
} from 'web/pages/overrides/dashboard/WordCloudDisplay';

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
