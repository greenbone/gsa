/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {CVES_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import DashboardControls from '../../components/dashboard/controls';

import ManualIcon from '../../components/icon/manualicon.js';

import CveFilterDialog from './filterdialog.js';
import CvesTable from './table.js';

import CvesDashboard, {CVES_DASHBOARD_ID} from './dashboard/index.js';

const ToolBarIcons = props => {
  return (
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="cve"
      title={_('Help: CVEs')}/>
  );
};

export default withEntitiesContainer('cve', {
  createFilterType: 'info',
  dashboard2: CvesDashboard,
  dashboardControls: () => (
    <DashboardControls dashboardId={CVES_DASHBOARD_ID}/>
  ),
  filterEditDialog: CveFilterDialog,
  filtersFilter: CVES_FILTER_FILTER,
  sectionIcon: 'cve.svg',
  table: CvesTable,
  title: _('CVEs'),
  toolBarIcons: ToolBarIcons,
})(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
