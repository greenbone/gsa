/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Filter, {CVES_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import CveIcon from 'web/components/icon/cveicon';
import ManualIcon from 'web/components/icon/manualicon';
import PageTitle from 'web/components/layout/pagetitle';

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
