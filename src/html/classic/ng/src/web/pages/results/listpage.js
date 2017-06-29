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

import  _ from 'gmp/locale.js';

import Layout from '../../components/layout/layout.js';

import EntitiesPage from '../../entities/page.js';
import {withEntitiesContainer} from '../../entities/container.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';

import ResultCharts from './charts.js';
import ResultsFilterDialog from './filterdialog.js';

import ResultsTable from './table.js';

import {RESULTS_FILTER_FILTER} from 'gmp/models/filter.js';

const Dashboard = withDashboard(ResultCharts, {
  hideFilterSelect: true,
  configPrefId: '0b8ae70d-d8fc-4418-8a72-e65ac8d2828e',
  defaultControllersString: 'result-by-severity-class|' +
    'result-by-vuln-words|result-by-cvss',
  defaultControllerString: 'result-by-cvss',
});

const ToolBarIcons = props => {
  return (
    <Layout flex box>
      <HelpIcon page="reports"/>
    </Layout>
  );
};

export default withEntitiesContainer(EntitiesPage, 'result', {
  filtersFilter: RESULTS_FILTER_FILTER,
  dashboard: Dashboard,
  title: _('Results'),
  sectionIcon: 'result.svg',
  toolBarIcons: ToolBarIcons,
  table: ResultsTable,
  filterEditDialog: ResultsFilterDialog,
});

// export default ResultsPage;

// vim: set ts=2 sw=2 tw=80:
