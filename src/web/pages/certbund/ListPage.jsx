/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import Filter, {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {CertBundAdvIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import CertBundDashboard, {
  CERTBUND_DASHBOARD_ID,
} from 'web/pages/certbund/dashboard';
import CertBundFilterDialog from 'web/pages/certbund/FilterDialog';
import CertBundTable from 'web/pages/certbund/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/certbund';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = () => (
  <ManualIcon
    anchor="cert-bund-advisories"
    page="managing-secinfo"
    title={_('Help: CERT-Bund Advisories')}
  />
);

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => (
  <React.Fragment>
    <PageTitle title={_('CERT-Bund Advisories')} />
    <EntitiesPage
      {...props}
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
