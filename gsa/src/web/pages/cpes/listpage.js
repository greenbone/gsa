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

import _ from 'gmp/locale';

import {CPES_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer2';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cpes';

import CpeFilterDialog from './filterdialog';
import CpesTable from './table';

import CpesDashboard, {CPES_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = props => (
  <ManualIcon
    page="vulnerabilitymanagement"
    anchor="cpe"
    title={_('Help: CPEs')}
  />
);

const Page = props => (
  <EntitiesPage
    {...props}
    createFilterType="info"
    dashboard2={CpesDashboard}
    dashboardControls={() => (
      <DashboardControls dashboardId={CPES_DASHBOARD_ID}/>
    )}
    filterEditDialog={CpeFilterDialog}
    sectionIcon="cpe.svg"
    table={CpesTable}
    title={_('CPEs')}
    toolBarIcons={ToolBarIcons}
  />
);

export default withEntitiesContainer('cpe', {
  entitiesSelector,
  filtersFilter: CPES_FILTER_FILTER,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
