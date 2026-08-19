/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DashboardControls, {
  type OnNewDisplayFunc,
} from 'web/components/dashboard/DashboardControls';
import DashboardView from 'web/components/dashboard/DashboardView';
import {
  canAddDisplay,
  type DashboardSettings,
} from 'web/components/dashboard/utils';
import Layout from 'web/components/layout/Layout';
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
import {TASKS_DISPLAYS} from 'web/pages/tasks/dashboard';
import {TICKETS_DISPLAYS} from 'web/pages/tickets/dashboard';
import {VULNERABILITIES_DISPLAYS} from 'web/pages/vulnerabilities/dashboard';

interface StartDashboardProps {
  id: string;
  loadSettings?: (id: string, defaults: DashboardSettings) => void;
  saveSettings: (id: string, settings: DashboardSettings) => void;
  settings: DashboardSettings;
  onNewDisplay: OnNewDisplayFunc;
  onResetDashboard: (id: string) => void;
  setDefaultSettings: (id: string, settings: DashboardSettings) => void;
  notify?: (message: string) => void;
}

const ALL_DISPLAYS = [
  ...TASKS_DISPLAYS,
  ...REPORTS_DISPLAYS,
  ...RESULTS_DISPLAYS,
  ...NOTES_DISPLAYS,
  ...OVERRIDES_DISPLAYS,
  ...VULNERABILITIES_DISPLAYS,
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
      <DashboardView
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
