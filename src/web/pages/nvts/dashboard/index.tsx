/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  NvtsCreatedDisplay,
  NvtsCreatedTableDisplay,
} from 'web/pages/nvts/dashboard/NvtCreatedDisplay';
import {
  NvtsCvssDisplay,
  NvtsCvssTableDisplay,
} from 'web/pages/nvts/dashboard/NvtCvssDisplay';
import {
  NvtsFamilyDisplay,
  NvtsFamilyTableDisplay,
} from 'web/pages/nvts/dashboard/NvtFamilyDisplay';
import {
  NvtsQodDisplay,
  NvtsQodTableDisplay,
} from 'web/pages/nvts/dashboard/NvtQodDisplay';
import {
  NvtsQodTypeDisplay,
  NvtsQodTypeTableDisplay,
} from 'web/pages/nvts/dashboard/NvtQodTypeDisplay';
import {
  NvtsSeverityClassDisplay,
  NvtsSeverityClassTableDisplay,
} from 'web/pages/nvts/dashboard/NvtSeverityClassDisplay';

interface NvtsDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const NVTS_DASHBOARD_ID = 'f68d9369-1945-477b-968f-121c6029971b';

export const NVTS_DISPLAYS = [
  NvtsCvssDisplay.displayId,
  NvtsFamilyDisplay.displayId,
  NvtsSeverityClassDisplay.displayId,
  NvtsQodDisplay.displayId,
  NvtsQodTypeDisplay.displayId,
  NvtsCreatedDisplay.displayId,
  NvtsCvssTableDisplay.displayId,
  NvtsSeverityClassTableDisplay.displayId,
  NvtsFamilyTableDisplay.displayId,
  NvtsCreatedTableDisplay.displayId,
  NvtsQodTableDisplay.displayId,
  NvtsQodTypeTableDisplay.displayId,
];

const NvtsDashboard = (props: NvtsDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        NvtsSeverityClassDisplay.displayId,
        NvtsCreatedDisplay.displayId,
        NvtsFamilyDisplay.displayId,
      ],
    ]}
    id={NVTS_DASHBOARD_ID}
    permittedDisplays={NVTS_DISPLAYS}
  />
);

export default NvtsDashboard;
