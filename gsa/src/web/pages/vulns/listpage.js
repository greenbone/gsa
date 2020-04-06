/* Copyright (C) 2017-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {VULNS_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import ManualIcon from 'web/components/icon/manualicon';
import VulnerabilityIcon from 'web/components/icon/vulnerabilityicon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/vulns';

import PropTypes from 'web/utils/proptypes';

import VulnsFilterDialog from './filterdialog';
import VulnsTable from './table';

import VulnerabilitiesDashboard, {VULNS_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      page="reports"
      anchor="displaying-all-existing-vulnerabilities"
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
      table={VulnsTable}
      tags={false}
      title={_('Vulnerabilities')}
      sectionIcon={<VulnerabilityIcon size="large" />}
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

export default withEntitiesContainer('vulnerability', {
  entitiesSelector,
  loadEntities,
})(Page);
