/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TranslatedDashboardControls as DashboardControls} from 'web/components/dashboard/Controls';
import {TranslatedDashboard as Dashboard} from 'web/components/dashboard/Dashboard';
import {canAddDisplay} from 'web/components/dashboard/Utils';
import Layout from 'web/components/layout/Layout';
import {AGENTS_DISPLAYS} from 'web/pages/agents/dashboard';
import {CERTBUND_DISPLAYS} from 'web/pages/certbund/dashboard';
import {CPES_DISPLAYS} from 'web/pages/cpes/dashboard';
import {CVES_DISPLAYS} from 'web/pages/cves/dashboard';
import {DFNCERT_DISPLAYS} from 'web/pages/dfncert/dashboard';
import {HOSTS_DISPLAYS} from 'web/pages/hosts/dashboard';
import {NOTES_DISPLAYS} from 'web/pages/notes/dashboard';
import {NVTS_DISPLAYS} from 'web/pages/nvts/dashboard';
import {OS_DISPLAYS} from 'web/pages/operatingsystems/dashboard';
import {OVERRIDES_DISPLAYS} from 'web/pages/overrides/dashboard';
import {AUDIT_REPORTS_DISPLAYS} from 'web/pages/reports/auditdashboard';
import {REPORTS_DISPLAYS} from 'web/pages/reports/dashboard';
import {RESULTS_DISPLAYS} from 'web/pages/results/dashboard';
import {DEFAULT_DISPLAYS} from 'web/pages/start/NewDashboardDialog';
import {type StartDashboardProps} from 'web/pages/start/types';
import {TASKS_DISPLAYS} from 'web/pages/tasks/dashboard';
import {TICKETS_DISPLAYS} from 'web/pages/tickets/dashboard';
import {VULNS_DISPLAYS} from 'web/pages/vulns/dashboard';

const ALL_DISPLAYS = [
  ...AGENTS_DISPLAYS,
  ...TASKS_DISPLAYS,
  ...REPORTS_DISPLAYS,
  ...RESULTS_DISPLAYS,
  ...NOTES_DISPLAYS,
  ...OVERRIDES_DISPLAYS,
  ...VULNS_DISPLAYS,
  ...HOSTS_DISPLAYS,
  ...OS_DISPLAYS,
  ...NVTS_DISPLAYS,
  ...CERTBUND_DISPLAYS,
  ...CVES_DISPLAYS,
  ...CPES_DISPLAYS,
  ...DFNCERT_DISPLAYS,
  ...TICKETS_DISPLAYS,
  ...AUDIT_REPORTS_DISPLAYS,
];

const StartDashboard = ({
  id,
  loadSettings = () => {},
  saveSettings,
  settings,
  onNewDisplay,
  onResetDashboard,
  setDefaultSettings,
  notify,
}: StartDashboardProps) => {
  return (
    <Layout grow flex="column">
      <Layout align="end">
        <DashboardControls
          canAdd={canAddDisplay(settings)}
          dashboardId={id}
          displayIds={ALL_DISPLAYS}
          settings={settings}
          onNewDisplay={onNewDisplay}
          onResetClick={onResetDashboard}
        />
      </Layout>
      <Dashboard
        showFilterSelection
        showFilterString
        defaultDisplays={DEFAULT_DISPLAYS}
        id={id}
        isLoading={false}
        loadSettings={loadSettings}
        notify={notify}
        permittedDisplays={ALL_DISPLAYS}
        saveSettings={saveSettings}
        setDefaultSettings={setDefaultSettings}
        settings={settings}
      />
    </Layout>
  );
};

export default StartDashboard;
