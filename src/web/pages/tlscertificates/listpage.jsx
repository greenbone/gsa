/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/controls';
import ManualIcon from 'web/components/icon/manualicon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tlscertificates';
import PropTypes from 'web/utils/proptypes';

import TlsCertificateComponent from './component';
import TlsCertificatesDashboard, {
  TLS_CERTIFICATES_DASHBOARD_ID,
} from './dashboard';
import TlsCertificatesFilterDialog from './filterdialog';
import TlsCertificateTable from './table';

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
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <TlsCertificateComponent
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
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
            filterEditDialog={TlsCertificatesFilterDialog}
            filtersFilter={TLS_CERTIFICATES_FILTER_FILTER}
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
};

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
