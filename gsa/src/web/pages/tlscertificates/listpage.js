/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';

import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tlscertificates';

import PropTypes from 'web/utils/proptypes';

import TlsCertificatesDashboard, {
  TLS_CERTIFICATES_DASHBOARD_ID,
} from './dashboard';
import TlsCertificateFilterDialog from './filterdialog';
import TlsCertificateTable from './table';
import TlsCertificateComponent from './component';

const ToolBarIcons = () => (
  <Layout>
    <ManualIcon
      page="managing-assets"
      anchor="managing-tls-certificates"
      title={_('Help: TLS Certificate Assets')}
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
  <TlsCertificateComponent
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
  >
    {({clone, create, delete: delete_func, download, edit, exportFunc}) => (
      <React.Fragment>
        <PageTitle title={_('TLS Certificates')} />
        <EntitiesPage
          {...props}
          dashboard={() => (
            <TlsCertificatesDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={TLS_CERTIFICATES_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filter={filter}
          filtersFilter={TLS_CERTIFICATES_FILTER_FILTER}
          filterEditDialog={TlsCertificateFilterDialog}
          sectionIcon={<TlsCertificateIcon size="large" />}
          table={TlsCertificateTable}
          title={_('TLS Certificates')}
          toolBarIcons={ToolBarIcons}
          onError={onError}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
          onTlsCertificateDeleteClick={delete_func}
          onTlsCertificateDownloadClick={download}
          onTlsCertificateExportClick={exportFunc}
        />
      </React.Fragment>
    )}
  </TlsCertificateComponent>
);

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('tlscertificate', {
  entitiesSelector,
  loadEntities,
})(Page);
