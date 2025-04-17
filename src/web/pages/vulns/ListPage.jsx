/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import Filter, {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {VulnerabilityIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import VulnerabilitiesDashboard, {
  VULNS_DASHBOARD_ID,
} from 'web/pages/vulns/dashboard';
import VulnsFilterDialog from 'web/pages/vulns/FilterDialog';
import VulnsTable from 'web/pages/vulns/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/vulns';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      anchor="displaying-all-existing-vulnerabilities"
      page="reports"
      title={_('Vulnerabilities')}
    />
  </Layout>
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('Vulnerabilities')} />
    <EntitiesPage
      {...props}
      dashboard={() => (
        <VulnerabilitiesDashboard
          filter={filter}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
        />
      )}
      dashboardControls={() => (
        <DashboardControls
          dashboardId={VULNS_DASHBOARD_ID}
          onInteraction={onInteraction}
        />
      )}
      filter={filter}
      filterEditDialog={VulnsFilterDialog}
      filtersFilter={VULNS_FILTER_FILTER}
      sectionIcon={<VulnerabilityIcon size="large" />}
      table={VulnsTable}
      tags={false}
      title={_('Vulnerabilities')}
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

const FALLBACK_VULNS_LIST_FILTER = Filter.fromString(
  'sort-reverse=severity first=1',
);

export default withEntitiesContainer('vulnerability', {
  fallbackFilter: FALLBACK_VULNS_LIST_FILTER,
  entitiesSelector,
  loadEntities,
})(Page);
