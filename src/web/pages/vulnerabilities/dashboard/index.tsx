/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as FilterType} from 'gmp/models/filter/filter-type';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  VulnerabilitiesCvssDisplay,
  VulnerabilitiesCvssTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesCvssDisplay';
import {
  VulnerabilitiesHostsDisplay,
  VulnerabilitiesHostsTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsDisplay';
import {
  VulnerabilitiesSeverityDisplay,
  VulnerabilitiesSeverityTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesSeverityClassDisplay';

interface VulnerabilitiesDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const VULNERABILITIES_DASHBOARD_ID =
  '43690dcb-3174-4d84-aa88-58c1936c7f5c';

export const VULNERABILITIES_DISPLAYS = [
  VulnerabilitiesCvssDisplay.displayId,
  VulnerabilitiesHostsDisplay.displayId,
  VulnerabilitiesSeverityDisplay.displayId,
  VulnerabilitiesCvssTableDisplay.displayId,
  VulnerabilitiesSeverityTableDisplay.displayId,
  VulnerabilitiesHostsTableDisplay.displayId,
];

const VulnerabilitiesDashboard = ({
  filter,
  onFilterChanged,
}: VulnerabilitiesDashboardProps) => (
  <Dashboard
    defaultDisplays={[
      [
        VulnerabilitiesCvssDisplay.displayId,
        VulnerabilitiesSeverityDisplay.displayId,
      ],
    ]}
    filter={filter}
    id={VULNERABILITIES_DASHBOARD_ID}
    permittedDisplays={VULNERABILITIES_DISPLAYS}
    onFilterChanged={onFilterChanged}
  />
);

export default VulnerabilitiesDashboard;
