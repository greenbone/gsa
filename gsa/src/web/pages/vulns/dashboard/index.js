/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Dashboard from 'web/components/dashboard/dashboard';

import {VulnsCvssDisplay, VulnsCvssTableDisplay} from './cvssdisplay';
import {VulnsHostsDisplay, VulnsHostsTableDisplay} from './hostsdisplay';
import {
  VulnsSeverityDisplay,
  VulnsSeverityTableDisplay,
} from './severityclassdisplay';

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
    id={VULNS_DASHBOARD_ID}
    permittedDisplays={VULNS_DISPLAYS}
    defaultDisplays={[
      [VulnsCvssDisplay.displayId, VulnsSeverityDisplay.displayId],
    ]}
  />
);

export default VulnerabilitiesDashboard;

// vim: set ts=2 sw=2 tw=80:
