/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter, {CPES_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {CpeLogoIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import CpeFilterDialog from 'web/pages/cpes/CpeFilterDialog';
import CpesDashboard, {CPES_DASHBOARD_ID} from 'web/pages/cpes/dashboard';
import CpesTable from 'web/pages/cpes/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cpes';
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <ManualIcon anchor="cpe" page="managing-secinfo" title={_('Help: CPEs')} />
  );
};

const Page = ({filter, onFilterChanged, ...props}) => {
  const [_] = useTranslation();

  return (
    <React.Fragment>
      <PageTitle title={_('CPEs')} />
      <EntitiesPage
        {...props}
        dashboard={() => (
          <CpesDashboard filter={filter} onFilterChanged={onFilterChanged} />
        )}
        dashboardControls={() => (
          <DashboardControls dashboardId={CPES_DASHBOARD_ID} />
        )}
        filter={filter}
        filterEditDialog={CpeFilterDialog}
        filtersFilter={CPES_FILTER_FILTER}
        sectionIcon={<CpeLogoIcon size="large" />}
        table={CpesTable}
        title={_('CPEs')}
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

const fallbackFilter = Filter.fromString('sort-reverse=modified');

export default withEntitiesContainer('cpe', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);
