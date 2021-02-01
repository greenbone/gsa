/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';
import PageTitle from 'web/components/layout/pagetitle';

import ManualIcon from 'web/components/icon/manualicon';
import NvtIcon from 'web/components/icon/nvticon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/nvts';

import PropTypes from 'web/utils/proptypes';

import NvtsFilterDialog from './filterdialog';
import NvtsTable from './table';

import NvtsDashboard, {NVTS_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = () => (
  <ManualIcon
    page="managing-secinfo"
    anchor="network-vulnerability-tests-nvt"
    title={_('Help: NVTs')}
  />
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('NVTs')} />
    <EntitiesPage
      {...props}
      createFilterType="info"
      dashboard={() => (
        <NvtsDashboard
          filter={filter}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
        />
      )}
      dashboardControls={() => (
        <DashboardControls
          dashboardId={NVTS_DASHBOARD_ID}
          onInteraction={onInteraction}
        />
      )}
      filter={filter}
      filterEditDialog={NvtsFilterDialog}
      filtersFilter={NVTS_FILTER_FILTER}
      sectionIcon={<NvtIcon size="large" />}
      table={NvtsTable}
      title={_('NVTs')}
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

const fallbackFilter = Filter.fromString('sort-reverse=created');

export default withEntitiesContainer('nvt', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
