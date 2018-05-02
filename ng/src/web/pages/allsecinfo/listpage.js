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

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import withDashboard from '../../components/dashboard/withDashboard.js';

import ManualIcon from '../../components/icon/manualicon.js';

import SecInfoCharts from './charts.js';
import SecInfoFilterDialog from './filterdialog.js';
import SecInfosTable from './table.js';

const ToolBarIcons = props => {
  return (
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="secinfo-management"
      title={_('Help: All SecInfo Information')}/>
  );
};

const Dashboard = withDashboard({
  hideFilterSelect: true,
  configPrefId: '4c7b1ea7-b7e6-4d12-9791-eb9f72b6f864',
  defaultControllersString: 'allinfo-by-severity-class|allinfo-by-created|' +
    'allinfo-by-cvss',
  defaultControllerString: 'allinfo-by-cvss',
})(SecInfoCharts);

export default withEntitiesContainer('secinfo', {
  dashboard: Dashboard,
  filterEditDialog: SecInfoFilterDialog,
  sectionIcon: 'allinfo.svg',
  table: SecInfosTable,
  title: _('All SecInfo Information'),
  toolBarIcons: ToolBarIcons,
})(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
