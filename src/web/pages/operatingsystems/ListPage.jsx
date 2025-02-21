/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import Filter, {OS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import ManualIcon from 'web/components/icon/ManualIcon';
import OsSvgIcon from 'web/components/icon/OsSvgIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/operatingsystems';
import PropTypes from 'web/utils/PropTypes';

import OsComponent from './Component';
import OsDashboard, {OS_DASHBOARD_ID} from './dashboard';
import OsFilterDialog from './FilterDialog';
import OsTable from './Table';

const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      anchor="managing-operating-systems"
      page="managing-assets"
      title={_('Help: Operating Systems')}
    />
  </Layout>
);

const Page = ({
  filter,
  onChanged,
  onDownloaded,
  onError,
  onFilterChanged,
  onInteraction,
  ...props
}) => (
  <OsComponent
    onCloneError={onError}
    onCloned={onChanged}
    onCreated={onChanged}
    onDeleteError={onError}
    onDeleted={onChanged}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, create, delete: delete_func, download, edit}) => (
      <React.Fragment>
        <PageTitle title={_('Operating Systems')} />
        <EntitiesPage
          {...props}
          createFilterType="os"
          dashboard={() => (
            <OsDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={OS_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filter={filter}
          filterEditDialog={OsFilterDialog}
          filtersFilter={OS_FILTER_FILTER}
          sectionIcon={<OsSvgIcon size="large" />}
          table={OsTable}
          title={_('Operating Systems')}
          toolBarIcons={ToolBarIcons}
          onError={onError}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
          onOsCloneClick={clone}
          onOsCreateClick={create}
          onOsDeleteClick={delete_func}
          onOsDownloadClick={download}
          onOsEditClick={edit}
        />
      </React.Fragment>
    )}
  </OsComponent>
);

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const FALLBACK_OS_LIST_FILTER = Filter.fromString(
  'sort-reverse=latest_severity first=1',
);

export default withEntitiesContainer('operatingsystem', {
  fallbackFilter: FALLBACK_OS_LIST_FILTER,
  entitiesSelector,
  loadEntities,
})(Page);
