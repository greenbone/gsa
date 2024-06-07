/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import {Dashboard} from 'web/components/dashboard/dashboard';
import {DashboardControls} from 'web/components/dashboard/controls';
import {canAddDisplay} from 'web/components/dashboard/utils';

import Layout from 'web/components/layout/layout';

import {TASKS_DISPLAYS} from '../tasks/dashboard';
import {REPORTS_DISPLAYS} from '../reports/dashboard';
import {RESULTS_DISPLAYS} from '../results/dashboard';
import {NOTES_DISPLAYS} from '../notes/dashboard';
import {OVERRIDES_DISPLAYS} from '../overrides/dashboard';
import {VULNS_DISPLAYS} from '../vulns/dashboard';
import {HOSTS_DISPLAYS} from '../hosts/dashboard';
import {OS_DISPLAYS} from '../operatingsystems/dashboard';
import {NVTS_DISPLAYS} from '../nvts/dashboard';
import {CERTBUND_DISPLAYS} from '../certbund/dashboard';
import {CVES_DISPLAYS} from '../cves/dashboard';
import {CPES_DISPLAYS} from '../cpes/dashboard';
import {DFNCERT_DISPLAYS} from '../dfncert/dashboard';
import {TICKETS_DISPLAYS} from '../tickets/dashboard';

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
