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

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import {withDashboard} from '../components/dashboard/dashboard.js';

import HelpIcon from '../components/icon/helpicon.js';

import CpeCharts from './charts.js';
import CpeFilterDialog from './filterdialog.js';
import CpesTable from './table.js';

const ToolBarIcons = props => {
  return (
    <HelpIcon
      page="cpes"
      title={_('Help: CPEs')}/>
  );
};

const Dashboard = withDashboard(CpeCharts, {
  hideFilterSelect: true,
  configPrefId: '9cff9b4d-b164-43ce-8687-f2360afc7500',
  defaultControllersString: 'cpe-by-severity-class|cpe-by-created|' +
    'cpe-by-cvss',
  defaultControllerString: 'cpe-by-cvss',
});

export default withEntitiesContainer(EntitiesPage, 'cpe', {
  dashboard: Dashboard,
  filterEditDialog: CpeFilterDialog,
  sectionIcon: 'cpe.svg',
  table: CpesTable,
  title: _('CPEs'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
