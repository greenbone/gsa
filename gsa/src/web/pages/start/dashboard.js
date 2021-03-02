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

import PropTypes from 'web/utils/proptypes';

import {Dashboard} from 'web/components/dashboard/dashboard';
import {DashboardControls} from 'web/components/dashboard/controls';
import {canAddDisplay} from 'web/components/dashboard/utils';

import Layout from 'web/components/layout/layout';

import {TASKS_DISPLAYS} from 'web/pages/tasks/dashboard';
import {REPORTS_DISPLAYS} from 'web/pages/reports/dashboard';
import {RESULTS_DISPLAYS} from 'web/pages/results/dashboard';
import {NOTES_DISPLAYS} from 'web/pages/notes/dashboard';
import {OVERRIDES_DISPLAYS} from 'web/pages/overrides/dashboard';
import {VULNS_DISPLAYS} from 'web/pages/vulns/dashboard';
import {HOSTS_DISPLAYS} from 'web/pages/hosts/dashboard';
import {OS_DISPLAYS} from 'web/pages/operatingsystems/dashboard';
import {NVTS_DISPLAYS} from 'web/pages/nvts/dashboard';
import {OVALDEF_DISPLAYS} from 'web/pages/ovaldefs/dashboard';
import {CERTBUND_DISPLAYS} from 'web/pages/certbund/dashboard';
import {CVES_DISPLAYS} from 'web/pages/cves/dashboard';
import {CPES_DISPLAYS} from 'web/pages/cpes/dashboard';
import {DFNCERT_DISPLAYS} from 'web/pages/dfncert/dashboard';
import {TICKETS_DISPLAYS} from 'web/pages/tickets/dashboard';

import {DEFAULT_DISPLAYS} from './newdashboarddialog';

const ALL_DISPLAYS = [
  ...TASKS_DISPLAYS,
  ...REPORTS_DISPLAYS,
  ...RESULTS_DISPLAYS,
  ...NOTES_DISPLAYS,
  ...OVERRIDES_DISPLAYS,
  ...VULNS_DISPLAYS,
  ...HOSTS_DISPLAYS,
  ...OS_DISPLAYS,
  ...NVTS_DISPLAYS,
  ...OVALDEF_DISPLAYS,
  ...CERTBUND_DISPLAYS,
  ...CVES_DISPLAYS,
  ...CPES_DISPLAYS,
  ...DFNCERT_DISPLAYS,
  ...TICKETS_DISPLAYS,
];

const StartDashboard = ({
  id,
  loadSettings,
  saveSettings,
  settings,
  onInteraction,
  onNewDisplay,
  onResetDashboard,
  ...props
}) => (
  <Layout flex="column" grow>
    <Layout align="end">
      <DashboardControls
        settings={settings}
        canAdd={canAddDisplay(props)}
        dashboardId={id}
        displayIds={ALL_DISPLAYS}
        onInteraction={onInteraction}
        onNewDisplay={onNewDisplay}
        onResetClick={onResetDashboard}
      />
    </Layout>
    <Dashboard
      {...props}
      id={id}
      isLoading={false}
      settings={settings}
      showFilterSelection
      showFilterString
      defaultDisplays={DEFAULT_DISPLAYS}
      permittedDisplays={ALL_DISPLAYS}
      loadSettings={loadSettings}
      saveSettings={saveSettings}
      onInteraction={onInteraction}
    />
  </Layout>
);

StartDashboard.propTypes = {
  id: PropTypes.id.isRequired,
  loadSettings: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.object,
  onInteraction: PropTypes.func.isRequired,
  onNewDisplay: PropTypes.func.isRequired,
  onResetDashboard: PropTypes.func.isRequired,
};

export default StartDashboard;

// vim: set ts=2 sw=2 tw=80:
