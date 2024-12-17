/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';


import {VulnsCvssDisplay, VulnsCvssTableDisplay} from './cvssdisplay';
import {VulnsHostsDisplay, VulnsHostsTableDisplay} from './hostsdisplay';
import {
  VulnsSeverityDisplay,
  VulnsSeverityTableDisplay,
} from './severityclassdisplay';
import Dashboard from '../../../components/dashboard/dashboard';

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

// vim: set ts=2 sw=2 tw=80:
