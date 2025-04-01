/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  HostsCvssDisplay,
  HostsCvssTableDisplay,
} from 'web/pages/hosts/dashboard/CvssDisplay';
import {HostsTopologyDisplay} from 'web/pages/hosts/dashboard/HostsTopologyDisplay';
import {
  HostsVulnScoreDisplay,
  HostsVulnScoreTableDisplay,
} from 'web/pages/hosts/dashboard/HostsVulnScoreDisplay';
import {
  HostsModifiedDisplay,
  HostsModifiedTableDisplay,
} from 'web/pages/hosts/dashboard/ModifiedDisplay';
import {
  HostsModifiedHighDisplay,
  HostsModifiedHighTableDisplay,
} from 'web/pages/hosts/dashboard/ModifiedHighDisplay';
import {
  HostsSeverityClassDisplay,
  HostsSeverityClassTableDisplay,
} from 'web/pages/hosts/dashboard/SeverityClassDisplay';

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
    defaultDisplays={[
      [
        HostsSeverityClassDisplay.displayId,
        HostsTopologyDisplay.displayId,
        HostsModifiedDisplay.displayId,
      ],
    ]}
    id={HOSTS_DASHBOARD_ID}
    permittedDisplays={HOSTS_DISPLAYS}
  />
);

export default HostsDashboard;
