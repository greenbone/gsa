/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

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

const ToolBarIcons = () => (
  <ManualIcon
    page="vulnerabilitymanagement"
    anchor="network-vulnerability-tests"
    title={_('Help: NVTs')}
  />
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
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
);

Page.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('nvt', {
  entitiesSelector,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
