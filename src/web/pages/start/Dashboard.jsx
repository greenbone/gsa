/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {DashboardControls} from 'web/components/dashboard/Controls';
import {Dashboard} from 'web/components/dashboard/Dashboard';
import {canAddDisplay} from 'web/components/dashboard/Utils';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';

import {DEFAULT_DISPLAYS} from './NewDashboardDialog';
import {CERTBUND_DISPLAYS} from '../certbund/dashboard';
import {CPES_DISPLAYS} from '../cpes/dashboard';
import {CVES_DISPLAYS} from '../cves/dashboard';
import {DFNCERT_DISPLAYS} from '../dfncert/dashboard';
import {HOSTS_DISPLAYS} from '../hosts/dashboard';
import {NOTES_DISPLAYS} from '../notes/dashboard';
import {NVTS_DISPLAYS} from '../nvts/dashboard';
import {OS_DISPLAYS} from '../operatingsystems/dashboard';
import {OVERRIDES_DISPLAYS} from '../overrides/dashboard';
import {AUDIT_REPORTS_DISPLAYS} from '../reports/auditdashboard';
import {REPORTS_DISPLAYS} from '../reports/dashboard';
import {RESULTS_DISPLAYS} from '../results/dashboard';
import {TASKS_DISPLAYS} from '../tasks/dashboard';
import {TICKETS_DISPLAYS} from '../tickets/dashboard';
import {VULNS_DISPLAYS} from '../vulns/dashboard';

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
  loadSettings,
  saveSettings,
  settings,
  onInteraction,
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
          onInteraction={onInteraction}
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
        onInteraction={onInteraction}
      />
    </Layout>
  );
};

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
