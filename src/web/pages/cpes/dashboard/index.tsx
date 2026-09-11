/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {FilterType} from 'gmp/models/filter';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  CpesCreatedDisplay,
  CpesCreatedTableDisplay,
} from 'web/pages/cpes/dashboard/CpeCreatedDisplay';
import {
  CpesCvssDisplay,
  CpesCvssTableDisplay,
} from 'web/pages/cpes/dashboard/CpeCvssDisplay';
import {
  CpesSeverityClassDisplay,
  CpesSeverityClassTableDisplay,
} from 'web/pages/cpes/dashboard/CpeSeverityClassDisplay';

interface CpeDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const CPES_DASHBOARD_ID = '9cff9b4d-b164-43ce-8687-f2360afc7500';

export const CPES_DISPLAYS = [
  CpesCreatedDisplay.displayId,
  CpesCreatedTableDisplay.displayId,
  CpesCvssDisplay.displayId,
  CpesCvssTableDisplay.displayId,
  CpesSeverityClassDisplay.displayId,
  CpesSeverityClassTableDisplay.displayId,
];

const CpesDashboard = (props: CpeDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        CpesSeverityClassDisplay.displayId,
        CpesCreatedDisplay.displayId,
        CpesCvssDisplay.displayId,
      ],
    ]}
    id={CPES_DASHBOARD_ID}
    permittedDisplays={CPES_DISPLAYS}
  />
);

export default CpesDashboard;
