/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {VulnsCvssDisplay, VulnsCvssTableDisplay} from './CvssDisplay';
import {VulnsHostsDisplay, VulnsHostsTableDisplay} from './HostsDisplay';
import {
  VulnsSeverityDisplay,
  VulnsSeverityTableDisplay,
} from './SeverityClassDisplay';
import Dashboard from '../../../components/dashboard/Dashboard';

export const VULNS_DASHBOARD_ID = '43690dcb-3174-4d84-aa88-58c1936c7f5c';

export const VULNS_DISPLAYS = [
  VulnsCvssDisplay.displayId,
  VulnsHostsDisplay.displayId,
  VulnsSeverityDisplay.displayId,
  VulnsCvssTableDisplay.displayId,
  VulnsSeverityTableDisplay.displayId,
  VulnsHostsTableDisplay.displayId,
];

const VulnerabilitiesDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [VulnsCvssDisplay.displayId, VulnsSeverityDisplay.displayId],
    ]}
    id={VULNS_DASHBOARD_ID}
    permittedDisplays={VULNS_DISPLAYS}
  />
);

export default VulnerabilitiesDashboard;
