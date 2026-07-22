/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as FilterType} from 'gmp/models/filter/filter-type';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  VulnsCvssDisplay,
  VulnsCvssTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsCvssDisplay';
import {
  VulnsHostsDisplay,
  VulnsHostsTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsHostsDisplay';
import {
  VulnsSeverityDisplay,
  VulnsSeverityTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsSeverityClassDisplay';

interface VulnerabilitiesDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const VULNS_DASHBOARD_ID = '43690dcb-3174-4d84-aa88-58c1936c7f5c';

export const VULNS_DISPLAYS = [
  VulnsCvssDisplay.displayId,
  VulnsHostsDisplay.displayId,
  VulnsSeverityDisplay.displayId,
  VulnsCvssTableDisplay.displayId,
  VulnsSeverityTableDisplay.displayId,
  VulnsHostsTableDisplay.displayId,
];

const VulnerabilitiesDashboard = ({
  filter,
  onFilterChanged,
}: VulnerabilitiesDashboardProps) => (
  <Dashboard
    defaultDisplays={[
      [VulnsCvssDisplay.displayId, VulnsSeverityDisplay.displayId],
    ]}
    filter={filter}
    id={VULNS_DASHBOARD_ID}
    permittedDisplays={VULNS_DISPLAYS}
    onFilterChanged={onFilterChanged}
  />
);

export default VulnerabilitiesDashboard;
