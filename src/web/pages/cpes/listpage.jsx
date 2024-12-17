/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import Filter, {CPES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/controls';
import CpeLogoIcon from 'web/components/icon/cpelogoicon';
import ManualIcon from 'web/components/icon/manualicon';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cpes';
import PropTypes from 'web/utils/proptypes';


import CpesDashboard, {CPES_DASHBOARD_ID} from './dashboard';
import CpeFilterDialog from './filterdialog';
import CpesTable from './table';

export const ToolBarIcons = props => (
  <ManualIcon anchor="cpe" page="managing-secinfo" title={_('Help: CPEs')} />
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('CPEs')} />
    <EntitiesPage
      {...props}
      dashboard={() => (
        <CpesDashboard
          filter={filter}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
        />
      )}
      dashboardControls={() => (
        <DashboardControls
          dashboardId={CPES_DASHBOARD_ID}
          onInteraction={onInteraction}
        />
      )}
      filter={filter}
      filterEditDialog={CpeFilterDialog}
      filtersFilter={CPES_FILTER_FILTER}
      sectionIcon={<CpeLogoIcon size="large" />}
      table={CpesTable}
      title={_('CPEs')}
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

const fallbackFilter = Filter.fromString('sort-reverse=modified');

export default withEntitiesContainer('cpe', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
