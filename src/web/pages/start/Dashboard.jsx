/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {TranslatedDashboardControls as DashboardControls} from 'web/components/dashboard/Controls';
import {TranslatedDashboard as Dashboard} from 'web/components/dashboard/Dashboard';
import {canAddDisplay} from 'web/components/dashboard/Utils';
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
import {VULNS_DISPLAYS} from 'web/pages/vulns/dashboard';
import PropTypes from 'web/utils/PropTypes';

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
  ...CERTBUND_DISPLAYS,
  ...CVES_DISPLAYS,
  ...CPES_DISPLAYS,
  ...DFNCERT_DISPLAYS,
  ...TICKETS_DISPLAYS,
  ...AUDIT_REPORTS_DISPLAYS,
];

const StartDashboard = ({
  id,
  loadSettings = () => Promise.resolve({}),
  saveSettings,
  settings,
  onNewDisplay,
  onResetDashboard,
  ...props
}) => {
  return (
    <Layout grow flex="column">
      <Layout align="end">
        <DashboardControls
          canAdd={canAddDisplay(props)}
          dashboardId={id}
          displayIds={ALL_DISPLAYS}
          settings={settings}
          onNewDisplay={onNewDisplay}
          onResetClick={onResetDashboard}
        />
      </Layout>
      <Dashboard
        {...props}
        showFilterSelection
        showFilterString
        defaultDisplays={DEFAULT_DISPLAYS}
        id={id}
        isLoading={false}
        loadSettings={loadSettings}
        permittedDisplays={ALL_DISPLAYS}
        saveSettings={saveSettings}
        settings={settings}
      />
    </Layout>
  );
};

StartDashboard.propTypes = {
  id: PropTypes.id.isRequired,
  loadSettings: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.object,
  onNewDisplay: PropTypes.func.isRequired,
  onResetDashboard: PropTypes.func.isRequired,
};

export default StartDashboard;
