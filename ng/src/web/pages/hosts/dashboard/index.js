/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import PropTypes from '../../../utils/proptypes';

import Dashboard from '../../../components/dashboard2/dashboard';

import HostsCvssDisplay from './cvssdisplay';
import HostsSeverityClassDisplay from './severityclassdisplay';
import HostsTopologyDisplay from './topologydisplay';
import HostsVulnScoreDisplay from './vulnscoredisplay';

export const HOSTS_DASHBOARD_ID = 'd3f5f2de-a85b-43f2-a817-b127457cc8ba';

const HostsDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={HOSTS_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={[
      HostsCvssDisplay.displayId,
      HostsSeverityClassDisplay.displayId,
      HostsTopologyDisplay.displayId,
      HostsVulnScoreDisplay.displayId,
    ]}
    defaultContent={[
      [
        HostsSeverityClassDisplay.displayId,
        HostsTopologyDisplay.displayId,
        HostsCvssDisplay.displayId,
        // 'host-by-modification-time', // TODO
      ],
    ]}
    maxItemsPerRow={4}
    maxRows={4}
    onFilterChanged={onFilterChanged}
  />
);

HostsDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default HostsDashboard;

// vim: set ts=2 sw=2 tw=80:
