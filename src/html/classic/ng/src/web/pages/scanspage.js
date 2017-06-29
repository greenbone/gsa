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

import TaskCharts from './tasks/charts.js';
import ReportCharts from '../reports/charts.js';
import ResultCharts from './results/charts.js';
import NoteCharts from '../notes/charts.js';
import OverrideCharts from '../overrides/charts.js';
import VulnCharts from '../vulns/charts.js';

class ScansPage extends React.Component {

  constructor(...args) {
    super(...args);

    const {caches} = this.context;

    this.cache = caches.get('scansdashboard');
  }

  getChildContext() {
    return {cache: this.cache};
  }

  render() {
    return (
      <Section title={_('Scans Dashboard')} img="scan.svg"
        extra={<DashboardControls/>}>
        <Dashboard
          configPrefId="c7584d7c-649f-4f8b-9ded-9e1dc20f24c8"
          defaultControllersString={'result-by-severity-class|' +
            'report-by-severity-class#task-by-status|report-by-high-results|' +
            'task-by-severity-class'}
          defaultControllerString="task-by-severity-class"
          maxComponents="8">
          <TaskCharts/>
          <ReportCharts/>
          <ResultCharts/>
          <NoteCharts/>
          <OverrideCharts/>
          <VulnCharts/>
        </Dashboard>
      </Section>
    );
  }
}

ScansPage.contextTypes = {
  caches: PropTypes.cachefactory.isRequired,
};

ScansPage.childContextTypes = {
  cache: PropTypes.cache,
};

export default ScansPage;

// vim: set ts=2 sw=2 tw=80:
