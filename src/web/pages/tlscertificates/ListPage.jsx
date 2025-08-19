/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {TlsCertificateIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import TlsCertificatesDashboard, {
  TLS_CERTIFICATES_DASHBOARD_ID,
} from 'web/pages/tlscertificates/dashboard';
import TlsCertificateTable from 'web/pages/tlscertificates/Table';
import TlsCertificateComponent from 'web/pages/tlscertificates/TlsCertificateComponent';
import TlsCertificateFilterDialog from 'web/pages/tlscertificates/TlsCertificateFilterDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tlscertificates';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <Layout>
      <ManualIcon
        anchor="managing-tls-certificates"
        page="managing-assets"
        title={_('Help: TLS Certificate Assets')}
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
    <TlsCertificateComponent
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
    >
      {({delete: delete_func, download, exportFunc}) => (
        <React.Fragment>
          <PageTitle title={_('TLS Certificates')} />
          <EntitiesPage
            {...props}
            dashboard={() => (
              <TlsCertificatesDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
              />
            )}
            dashboardControls={() => (
              <DashboardControls dashboardId={TLS_CERTIFICATES_DASHBOARD_ID} />
            )}
            filter={filter}
            filterEditDialog={TlsCertificateFilterDialog}
            filtersFilter={TLS_CERTIFICATES_FILTER_FILTER}
            sectionIcon={<TlsCertificateIcon size="large" />}
            table={TlsCertificateTable}
            title={_('TLS Certificates')}
            toolBarIcons={ToolBarIcons}
            onError={onError}
            onFilterChanged={onFilterChanged}
            onTlsCertificateDeleteClick={delete_func}
            onTlsCertificateDownloadClick={download}
            onTlsCertificateExportClick={exportFunc}
          />
        </React.Fragment>
      )}
    </TlsCertificateComponent>
  );
};

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

export default withEntitiesContainer('tlscertificate', {
  entitiesSelector,
  loadEntities,
})(Page);
