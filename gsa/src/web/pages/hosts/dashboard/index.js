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

import {HostsCvssDisplay, HostsCvssTableDisplay} from './cvssdisplay';
import {
  HostsModifiedDisplay,
  HostsModifiedTableDisplay,
} from './modifieddisplay';
import {
  HostsModifiedHighDisplay,
  HostsModifiedHighTableDisplay,
} from './modifiedhighdisplay';
import {
  HostsSeverityClassDisplay,
  HostsSeverityClassTableDisplay,
} from './severityclassdisplay';
import {HostsTopologyDisplay} from './topologydisplay';
import {
  HostsVulnScoreDisplay,
  HostsVulnScoreTableDisplay,
} from './vulnscoredisplay';

export const HOSTS_DASHBOARD_ID = 'd3f5f2de-a85b-43f2-a817-b127457cc8ba';

export const HOSTS_DISPLAYS = [
  HostsCvssDisplay.displayId,
  HostsModifiedDisplay.displayId,
  HostsModifiedHighDisplay.displayId,
  HostsSeverityClassDisplay.displayId,
  HostsTopologyDisplay.displayId,
  HostsVulnScoreDisplay.displayId,
  HostsCvssTableDisplay.displayId,
  HostsSeverityClassTableDisplay.displayId,
  HostsModifiedTableDisplay.displayId,
  HostsModifiedHighTableDisplay.displayId,
  HostsVulnScoreTableDisplay.displayId,
];

const HostsDashboard = props => (
  <Dashboard
    {...props}
    id={HOSTS_DASHBOARD_ID}
    permittedDisplays={HOSTS_DISPLAYS}
    defaultDisplays={[
      [
        HostsSeverityClassDisplay.displayId,
        HostsTopologyDisplay.displayId,
        HostsModifiedDisplay.displayId,
      ],
    ]}
  />
);

export default HostsDashboard;

// vim: set ts=2 sw=2 tw=80:
