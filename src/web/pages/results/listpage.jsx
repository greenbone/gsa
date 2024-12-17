/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import Filter, {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/controls';
import ManualIcon from 'web/components/icon/manualicon';
import ResultIcon from 'web/components/icon/resulticon';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/results';
import PropTypes from 'web/utils/proptypes';

import ResultsDashboard, {RESULTS_DASHBOARD_ID} from './dashboard';
import ResultsFilterDialog from './filterdialog';
import ResultsTable from './table';

export const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      anchor="displaying-all-existing-results"
      page="reports"
      title={_('Help: Results')}
    />
  </Layout>
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('Results')} />
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
      filterEditDialog={ResultsFilterDialog}
      filtersFilter={RESULTS_FILTER_FILTER}
      sectionIcon={<ResultIcon size="large" />}
      table={ResultsTable}
      title={_('Results')}
      toolBarIcons={ToolBarIcons}
      onFilterChanged={onFilterChanged}
      onInteraction={onInteraction}
    />
  </React.Fragment>
);

Page.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const fallbackFilter = Filter.fromString('sort-reverse=severity');

export default withEntitiesContainer('result', {
  entitiesSelector,
  loadEntities,
  fallbackFilter,
})(Page);

// vim: set ts=2 sw=2 tw=80:
