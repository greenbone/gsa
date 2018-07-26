/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import _ from 'gmp/locale';

import {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';

import NvtsFilterDialog from './filterdialog';
import NvtsTable from './table';

import NvtsDashboard, {NVTS_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = props => {
  return (
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="network-vulnerability-tests"
      title={_('Help: NVTs')}
    />
  );
};

export default withEntitiesContainer('nvt', {
  createFilterType: 'info',
  dashboard2: NvtsDashboard,
  dashboardControls: () => (
    <DashboardControls dashboardId={NVTS_DASHBOARD_ID}/>
  ),
  filterEditDialog: NvtsFilterDialog,
  filtersFilter: NVTS_FILTER_FILTER,
  sectionIcon: 'nvt.svg',
  table: NvtsTable,
  title: _('NVTs'),
  toolBarIcons: ToolBarIcons,
})(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
