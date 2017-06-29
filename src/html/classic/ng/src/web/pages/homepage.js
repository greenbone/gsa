/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import PropTypes from '../utils/proptypes.js';

import Dashboard from '../components/dashboard/dashboard.js';
import DashboardControls from '../components/dashboard/controls.js';

import Section from '../components/section/section.js';

import TaskCharts from '../tasks/charts.js';
import ReportCharts from '../reports/charts.js';
import ResultCharts from '../results/charts.js';
import NoteCharts from '../notes/charts.js';
import OverrideCharts from '../overrides/charts.js';
import VulnCharts from '../vulns/charts.js';
import HostCharts from '../hosts/charts.js';
import OsCharts from '../os/charts.js';
import NvtCharts from '../nvts/charts.js';
import OvaldefCharts from '../ovaldefs/charts.js';
import CertBundCharts from '../certbund/charts.js';
import CveCharts from '../cves/charts.js';
import CpeCharts from '../cpes/charts.js';
import DfnCertCharts from '../dfncert/charts.js';
import SecinfoCharts from '../secinfo/charts.js';

class Home extends React.Component {

  constructor(...args) {
    super(...args);

    const {caches} = this.context;

    this.cache = caches.get('homedashboard');
  }

  getChildContext() {
    return {cache: this.cache};
  }

  render() {
    return (
      <Section title={_('Dashboard')} img="dashboard.svg"
        extra={<DashboardControls/>}>
        <Dashboard
          configPrefId="d97eca9f-0386-4e5d-88f2-0ed7f60c0646"
          defaultControllersString={'task-by-severity-class|task-by-status#' +
            'cve-by-created|host-by-topology|nvt-by-severity-class'}
          defaultControllerString="task-by-severity-class"
          maxComponents="8">
          <TaskCharts/>
          <ReportCharts/>
          <ResultCharts/>
          <NoteCharts/>
          <OverrideCharts/>
          <VulnCharts/>
          <HostCharts/>
          <OsCharts/>
          <NvtCharts/>
          <OvaldefCharts/>
          <CertBundCharts/>
          <CveCharts/>
          <CpeCharts/>
          <DfnCertCharts/>
          <SecinfoCharts/>
        </Dashboard>
      </Section>
    );
  }
}

Home.contextTypes = {
  caches: PropTypes.cachefactory.isRequired,
};

Home.childContextTypes = {
  cache: PropTypes.cache,
};

export default Home;

// vim: set ts=2 sw=2 tw=80:

