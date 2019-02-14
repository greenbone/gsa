/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import ResultIcon from 'web/components/icon/resulticon';

import Layout from 'web/components/layout/layout';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/results';

import PropTypes from 'web/utils/proptypes';

import ResultsFilterDialog from './filterdialog';
import ResultsTable from './table';
import ResultsDashboard, {RESULTS_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="results"
      title={_('Help: Results')}
    />
  </Layout>
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <EntitiesPage
    {...props}
    dashboard={() => (
      <ResultsDashboard
        filter={filter}
        onFilterChanged={onFilterChanged}
        onInteraction={onInteraction}
      />
    )}
    dashboardControls={() => (
      <DashboardControls
        dashboardId={RESULTS_DASHBOARD_ID}
        onInteraction={onInteraction}
      />
    )}
    filter={filter}
    filtersFilter={RESULTS_FILTER_FILTER}
    filterEditDialog={ResultsFilterDialog}
    sectionIcon={<ResultIcon size="large" />}
    title={_('Results')}
    toolBarIcons={ToolBarIcons}
    table={ResultsTable}
    onFilterChanged={onFilterChanged}
    onInteraction={onInteraction}
  />
);

Page.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('result', {
  entitiesSelector,
  loadEntities,
})(Page);

// export default ResultsPage;

// vim: set ts=2 sw=2 tw=80:
