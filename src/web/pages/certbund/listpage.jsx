/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Filter, {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import CertBundAdvIcon from 'web/components/icon/certbundadvicon';
import ManualIcon from 'web/components/icon/manualicon';

import PageTitle from 'web/components/layout/pagetitle';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/certbund';

import PropTypes from 'web/utils/proptypes';

import CertBundFilterDialog from './filterdialog';
import CertBundTable from './table';

import CertBundDashboard, {CERTBUND_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = props => (
  <ManualIcon
    page="managing-secinfo"
    anchor="cert-bund-advisories"
    title={_('Help: CERT-Bund Advisories')}
  />
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('CERT-Bund Advisories')} />
    <EntitiesPage
      {...props}
      createFilterType="info"
      dashboard={() => (
        <CertBundDashboard
          filter={filter}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
        />
      )}
      dashboardControls={() => (
        <DashboardControls
          dashboardId={CERTBUND_DASHBOARD_ID}
          onInteraction={onInteraction}
        />
      )}
      filter={filter}
      filterEditDialog={CertBundFilterDialog}
      filtersFilter={CERTBUND_FILTER_FILTER}
      sectionIcon={<CertBundAdvIcon size="large" />}
      table={CertBundTable}
      title={_('CERT-Bund Advisories')}
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

export default withEntitiesContainer('certbund', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);

// vim: set ts=2 sw=2 tw=80:
