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

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import {withDashboard} from '../components/dashboard/dashboard.js';

import HelpIcon from '../components/icon/helpicon.js';

import OvaldefCharts from './charts.js';
import OvaldefFilterDialog from './filterdialog.js';
import OvaldefsTable from './table.js';

const ToolBarIcons = props => {
  return (
    <HelpIcon
      page="ovaldefs"
      title={_('Help: OVAL Definitions')}/>
  );
};

const Dashboard = withDashboard(OvaldefCharts, {
  hideFilterSelect: true,
  configPrefId: '9563efc0-9f4e-4d1f-8f8d-0205e32b90a4',
  defaultControllersString: 'ovaldef-by-severity-class|ovaldef-by-created|' +
    'ovaldef-by-class',
  defaultControllerString: 'ovaldef-by-cvss',
});

export default withEntitiesContainer(EntitiesPage, 'ovaldef', {
  dashboard: Dashboard,
  filterEditDialog: OvaldefFilterDialog,
  sectionIcon: 'ovaldef.svg',
  table: OvaldefsTable,
  title: _('OVAL Definitions'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
