/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter, {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {DfnCertAdvIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import FilterDialog from 'web/pages/certbund/FilterDialog';
import DfnCertDashboard, {
  DFNCERT_DASHBOARD_ID,
} from 'web/pages/dfncert/dashboard';
import DfnCertTable from 'web/pages/dfncert/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/dfncerts';
import PropTypes from 'web/utils/PropTypes';
// DFN-CERT uses same filter dialog as CERT-Bund

const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <ManualIcon
      anchor="dfn-cert-advisories"
      page="managing-secinfo"
      title={_('Help: DFN-CERT Advisories')}
    />
  );
};

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => {
  const [_] = useTranslation();

  return (
    <React.Fragment>
      <PageTitle title={_('DFN-CERT Advisories')} />
      <EntitiesPage
        {...props}
        createFilterType="info"
        dashboard={() => (
          <DfnCertDashboard
            filter={filter}
            onFilterChanged={onFilterChanged}
            onInteraction={onInteraction}
          />
        )}
        dashboardControls={() => (
          <DashboardControls
            dashboardId={DFNCERT_DASHBOARD_ID}
            onInteraction={onInteraction}
          />
        )}
        filter={filter}
        filterEditDialog={FilterDialog}
        filtersFilter={DFNCERT_FILTER_FILTER}
        sectionIcon={<DfnCertAdvIcon size="large" />}
        table={DfnCertTable}
        title={_('DFN-CERT Advisories')}
        toolBarIcons={ToolBarIcons}
        onFilterChanged={onFilterChanged}
        onInteraction={onInteraction}
      />
    </React.Fragment>
  );
};

Page.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const fallbackFilter = Filter.fromString('sort-reverse=created');

export default withEntitiesContainer('dfncert', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);
