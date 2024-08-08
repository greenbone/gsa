/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Filter, {OS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import OsSvgIcon from 'web/components/icon/ossvgicon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/operatingsystems';

import OsFilterDialog from './filterdialog';
import OsTable from './table';
import OsComponent from './component';

import OsDashboard, {OS_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      page="managing-assets"
      anchor="managing-operating-systems"
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
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
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
          filtersFilter={OS_FILTER_FILTER}
          filterEditDialog={OsFilterDialog}
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
