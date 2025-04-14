/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import Filter, {CVES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {CveIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import CvesDashboard, {CVES_DASHBOARD_ID} from 'web/pages/cves/dashboard';
import CveFilterDialog from 'web/pages/cves/FilterDialog';
import CvesTable from 'web/pages/cves/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cves';
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = () => (
  <ManualIcon anchor="cve" page="managing-secinfo" title={_('Help: CVEs')} />
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
