/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {OS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

import Layout from 'web/components/layout/layout';

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
      page="vulnerabilitymanagement"
      anchor="operating-systems-view"
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

export default withEntitiesContainer('operatingsystem', {
  entitiesSelector,
  loadEntities,
})(Page);
