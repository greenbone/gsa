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

import Filter, {CVES_FILTER_FILTER} from 'gmp/models/filter';

import DashboardControls from 'web/components/dashboard/controls';

import CveIcon from 'web/components/icon/cveicon';
import ManualIcon from 'web/components/icon/manualicon';
import PageTitle from 'web/components/layout/pagetitle';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cves';

import PropTypes from 'web/utils/proptypes';

import CveFilterDialog from './filterdialog';
import CvesTable from './table';

import CvesDashboard, {CVES_DASHBOARD_ID} from './dashboard';

export const ToolBarIcons = () => (
  <ManualIcon page="managing-secinfo" anchor="cve" title={_('Help: CVEs')} />
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('CVEs')} />
    <EntitiesPage
      {...props}
      createFilterType="info"
      dashboard={() => (
        <CvesDashboard
          filter={filter}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
        />
      )}
      dashboardControls={() => (
        <DashboardControls
          dashboardId={CVES_DASHBOARD_ID}
          onInteraction={onInteraction}
        />
      )}
      filter={filter}
      filterEditDialog={CveFilterDialog}
      filtersFilter={CVES_FILTER_FILTER}
      sectionIcon={<CveIcon size="large" />}
      table={CvesTable}
      title={_('CVEs')}
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

const fallbackFilter = Filter.fromString('sort-reverse=name');

export default withEntitiesContainer('cve', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
