/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter, {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {CertBundAdvIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
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
const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <ManualIcon
      anchor="cert-bund-advisories"
      page="managing-secinfo"
      title={_('Help: CERT-Bund Advisories')}
    />
  );
};

const Page = ({filter, onFilterChanged, ...props}) => {
  const [_] = useTranslation();

  return (
    <React.Fragment>
      <PageTitle title={_('CERT-Bund Advisories')} />
      <EntitiesPage
        {...props}
        dashboard={() => (
          <CertBundDashboard
            filter={filter}
            onFilterChanged={onFilterChanged}
          />
        )}
        dashboardControls={() => (
          <DashboardControls dashboardId={CERTBUND_DASHBOARD_ID} />
        )}
        filter={filter}
        filterEditDialog={CertBundFilterDialog}
        filtersFilter={CERTBUND_FILTER_FILTER}
        sectionIcon={<CertBundAdvIcon size="large" />}
        table={CertBundTable}
        title={_('CERT-Bund Advisories')}
        toolBarIcons={ToolBarIcons}
        onFilterChanged={onFilterChanged}
      />
    </React.Fragment>
  );
};

Page.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
};

const fallbackFilter = Filter.fromString('sort-reverse=created');

export default withEntitiesContainer('certbund', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);
