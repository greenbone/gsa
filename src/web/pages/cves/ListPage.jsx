/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter, {CVES_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {CveIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import CveFilterDialog from 'web/pages/cves/CveFilterDialog';
import CvesDashboard, {CVES_DASHBOARD_ID} from 'web/pages/cves/dashboard';
import CvesTable from 'web/pages/cves/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/cves';
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <ManualIcon anchor="cve" page="managing-secinfo" title={_('Help: CVEs')} />
  );
};

const Page = ({filter, onFilterChanged, ...props}) => {
  const [_] = useTranslation();

  return (
    <React.Fragment>
      <PageTitle title={_('CVEs')} />
      <EntitiesPage
        {...props}
        createFilterType="info"
        dashboard={() => (
          <CvesDashboard filter={filter} onFilterChanged={onFilterChanged} />
        )}
        dashboardControls={() => (
          <DashboardControls dashboardId={CVES_DASHBOARD_ID} />
        )}
        filter={filter}
        filterEditDialog={CveFilterDialog}
        filtersFilter={CVES_FILTER_FILTER}
        sectionIcon={<CveIcon size="large" />}
        table={CvesTable}
        title={_('CVEs')}
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

const fallbackFilter = Filter.fromString('sort-reverse=name');

export default withEntitiesContainer('cve', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);
