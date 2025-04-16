/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {NvtIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import NvtsDashboard, {NVTS_DASHBOARD_ID} from 'web/pages/nvts/dashboard';
import NvtsFilterDialog from 'web/pages/nvts/FilterDialog';
import NvtsTable from 'web/pages/nvts/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/nvts';
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <ManualIcon
      anchor="vulnerability-tests-vt"
      page="managing-secinfo"
      title={_('Help: NVTs')}
    />
  );
};

const Page = ({filter, onFilterChanged, onInteraction, ...props}) => {
  const [_] = useTranslation();

  return (
    <React.Fragment>
      <PageTitle title={_('NVTs')} />
      <EntitiesPage
        {...props}
        createFilterType="info"
        dashboard={() => (
          <NvtsDashboard
            filter={filter}
            onFilterChanged={onFilterChanged}
            onInteraction={onInteraction}
          />
        )}
        dashboardControls={() => (
          <DashboardControls
            dashboardId={NVTS_DASHBOARD_ID}
            onInteraction={onInteraction}
          />
        )}
        filter={filter}
        filterEditDialog={NvtsFilterDialog}
        filtersFilter={NVTS_FILTER_FILTER}
        sectionIcon={<NvtIcon size="large" />}
        table={NvtsTable}
        title={_('NVTs')}
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

export default withEntitiesContainer('nvt', {
  entitiesSelector,
  fallbackFilter,
  loadEntities,
})(Page);
