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

import _ from 'gmp/locale.js';

import Layout from '../../components/layout/layout.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';

import {VULNS_FILTER_FILTER} from 'gmp/models/filter.js';

import VulnsCharts from './charts.js';
import VulnsFilterDialog from './filterdialog.js';
import VulnsTable from './table.js';

const Dashboard = withDashboard(VulnsCharts, {
  configPrefId: '43690dcb-3174-4d84-aa88-58c1936c7f5c',
  defaultControllersString: 'vuln-by-cvss|vuln-by-severity-class',
  defaultControllerString: 'vuln-by-cvss',
  hideFilterSelect: true,
});

const ToolBarIcons = () => {
  return (
    <Layout flex box>
      <HelpIcon page="vulns" title={_('Vulnerabilities')}/>
    </Layout>
  );
};

export default withEntitiesContainer('vuln', {
  dashboard: Dashboard,
  filterEditDialog: VulnsFilterDialog,
  filtersFilter: VULNS_FILTER_FILTER,
  table: VulnsTable,
  title: _('Vulnerabilities'),
  sectionIcon: 'vulnerability.svg',
  toolBarIcons: ToolBarIcons,
})(EntitiesPage);
