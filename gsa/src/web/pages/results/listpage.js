/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';

import Layout from 'web/components/layout/layout';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';

import ResultsFilterDialog from './filterdialog';
import ResultsTable from './table';
import ResultsDashboard, {RESULTS_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = props => {
  return (
    <Layout flex box>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="results"
        title={_('Help: Results')}
      />
    </Layout>
  );
};

export default withEntitiesContainer('result', {
  filtersFilter: RESULTS_FILTER_FILTER,
  dashboard2: ResultsDashboard,
  dashboardControls: () => (
    <DashboardControls dashboardId={RESULTS_DASHBOARD_ID} />
  ),
  title: _('Results'),
  sectionIcon: 'result.svg',
  toolBarIcons: ToolBarIcons,
  table: ResultsTable,
  filterEditDialog: ResultsFilterDialog,
})(EntitiesPage);

// export default ResultsPage;

// vim: set ts=2 sw=2 tw=80:
