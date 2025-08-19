/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter, {OS_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {OsSvgIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import OsComponent from 'web/pages/operatingsystems/Component';
import OsDashboard, {
  OS_DASHBOARD_ID,
} from 'web/pages/operatingsystems/dashboard';
import OperatingSystemFilterDialog from 'web/pages/operatingsystems/OperatingSystemFilterDialog';
import OsTable from 'web/pages/operatingsystems/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/operatingsystems';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <Layout>
      <ManualIcon
        anchor="managing-operating-systems"
        page="managing-assets"
        title={_('Help: Operating Systems')}
      />
    </Layout>
  );
};

const Page = ({
  filter,
  onChanged,
  onDownloaded,
  onError,
  onFilterChanged,

  ...props
}) => {
  const [_] = useTranslation();

  return (
    <OsComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit}) => (
        <React.Fragment>
          <PageTitle title={_('Operating Systems')} />
          <EntitiesPage
            {...props}
            createFilterType="os"
            dashboard={() => (
              <OsDashboard filter={filter} onFilterChanged={onFilterChanged} />
            )}
            dashboardControls={() => (
              <DashboardControls dashboardId={OS_DASHBOARD_ID} />
            )}
            filter={filter}
            filterEditDialog={OperatingSystemFilterDialog}
            filtersFilter={OS_FILTER_FILTER}
            sectionIcon={<OsSvgIcon size="large" />}
            table={OsTable}
            title={_('Operating Systems')}
            toolBarIcons={ToolBarIcons}
            onError={onError}
            onFilterChanged={onFilterChanged}
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
};

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

const FALLBACK_OS_LIST_FILTER = Filter.fromString(
  'sort-reverse=latest_severity first=1',
);

export default withEntitiesContainer('operatingsystem', {
  fallbackFilter: FALLBACK_OS_LIST_FILTER,
  entitiesSelector,
  loadEntities,
})(Page);
