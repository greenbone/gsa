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

import {VULNS_FILTER_FILTER} from 'gmp/models/filter';

import Layout from 'web/components/layout/layout';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer2';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/vulns';

import VulnsFilterDialog from './filterdialog';
import VulnsTable from './table';

import VulnerabilitiesDashboard, {VULNS_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      page="search"
      anchor="vulnerabilities"
      title={_('Vulnerabilities')}
    />
  </Layout>
);

const Page = props => (
  <EntitiesPage
    {...props}
    dashboard2={VulnerabilitiesDashboard}
    filterEditDialog={VulnsFilterDialog}
    filtersFilter={VULNS_FILTER_FILTER}
    table={VulnsTable}
    title={_('Vulnerabilities')}
    sectionIcon="vulnerability.svg"
    toolBarIcons={ToolBarIcons}
    dashboardControls={() => (
      <DashboardControls dashboardId={VULNS_DASHBOARD_ID} />
    )}
  />
);

export default withEntitiesContainer('vuln', {
  entitiesSelector,
  loadEntities,
})(Page);
