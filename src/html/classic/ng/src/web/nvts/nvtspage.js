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

import {withDashboard} from '../dashboard/dashboard.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';

import NvtsCharts from './charts.js';
import NvtsFilterDialog from './filterdialog.js';
import NvtsTable from './table.js';

const Dashboard = withDashboard(NvtsCharts, {
  hideFilterSelect: true,
  configPrefId: 'f68d9369-1945-477b-968f-121c6029971b',
  defaultControllersString: 'nvt-by-severity-class|nvt-by-created|' +
    'nvt-by-family',
  defaultControllerString: 'nvt-by-cvss',
});

const ToolBarIcons = props => {
  return (
    <HelpIcon
      page="nvts"
      title={_('Help: NVTs')}/>
  );
};

export default withEntitiesContainer(EntitiesPage, 'nvt', {
  dashboard: Dashboard,
  filterEditDialog: NvtsFilterDialog,
  sectionIcon: 'nvt.svg',
  table: NvtsTable,
  title: _('NVTs'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
