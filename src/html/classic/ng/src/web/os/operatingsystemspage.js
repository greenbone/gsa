/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import Layout from '../components/layout/layout.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import {withDashboard} from '../components/dashboard/dashboard.js';

import HelpIcon from '../components/icon/helpicon.js';

import OsCharts from './charts.js';
import OsFilterDialog from './filterdialog.js';
import OsTable from './table.js';

import {ASSETS_FILTER_FILTER} from '../../gmp/models/filter.js';

const Dashboard = withDashboard(OsCharts, {
  hideFilterSelect: true,
  configPrefId: 'e93b51ed-5881-40e0-bc4f-7d3268a36177',
  defaultControllersString: 'os-by-severity-class|os-by-most-vulnerable|' +
    'os-by-cvss',
  defaultControllerString: 'os-by-cvss',
});

const ToolbarIcons = props => {
  return (
    <Layout flex box>
      <HelpIcon
        page="oss"
        title={_('Help: Operating Systems')}/>
    </Layout>
  );
};

export default withEntitiesContainer(EntitiesPage, 'operatingsystem', {
  dashboard: Dashboard,
  filterEditDialog: OsFilterDialog,
  filtersFilter: ASSETS_FILTER_FILTER,
  sectionIcon: 'os.svg',
  table: OsTable,
  title: _('Operating Systems'),
  toolBarIcons: ToolbarIcons,
});
