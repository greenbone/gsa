/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Dashboard from 'web/components/dashboard/Dashboard';
import {AgentsNetworkTableDisplay} from 'web/pages/agents/dashboard/NetworkDisplay';
import {AgentsSeverityDisplay} from 'web/pages/agents/dashboard/SeverityClassDisplay';

export const AGENTS_DASHBOARD_ID = '8a4c7f4e-3a8b-4d5e-9f1a-2b3c4d5e6f7a';

export const AGENTS_DISPLAYS = [
  AgentsSeverityDisplay.displayId,
  AgentsNetworkTableDisplay.displayId,
];

const AgentsDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [AgentsSeverityDisplay.displayId, AgentsNetworkTableDisplay.displayId],
    ]}
    id={AGENTS_DASHBOARD_ID}
    permittedDisplays={AGENTS_DISPLAYS}
  />
);

export default AgentsDashboard;
