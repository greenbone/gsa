/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {SCANNERS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/ManualIcon';
import NewIcon from 'web/components/icon/NewIcon';
import ScannerIcon from 'web/components/icon/ScannerIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanners';
import PropTypes from 'web/utils/PropTypes';

import ScannerComponent from './Component';
import ScannersFilterDialog from './FilterDialog';
import ScannersTable from './Table';

const ToolBarIcons = ({onScannerCreateClick}) => {
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-scanners"
        page="scanning"
        title={_('Help: Scanners')}
      />
      {capabilities.mayCreate('scanner') &&
        gmp.settings.enableGreenboneSensor && (
          <NewIcon title={_('New Scanner')} onClick={onScannerCreateClick} />
        )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onScannerCreateClick: PropTypes.func.isRequired,
};

const ScannersPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  showSuccess,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <ScannerComponent
      onCertificateDownloadError={onError}
      onCertificateDownloaded={onDownloaded}
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onCredentialDownloadError={onError}
      onCredentialDownloaded={onDownloaded}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
      onVerified={() => {
        onChanged();
        showSuccess(_('Scanner Verified'));
      }}
      onVerifyError={onError}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        downloadcertificate,
        downloadcredential,
        edit,
        save,
        verify,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Scanners')} />
          <EntitiesPage
            {...props}
            filterEditDialog={ScannersFilterDialog}
            filtersFilter={SCANNERS_FILTER_FILTER}
            sectionIcon={<ScannerIcon size="large" />}
            table={ScannersTable}
            title={_('Scanners')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onDownloaded={onDownloaded}
            onError={onError}
            onInteraction={onInteraction}
            onScannerCertificateDownloadClick={downloadcertificate}
            onScannerCloneClick={clone}
            onScannerCreateClick={create}
            onScannerCredentialDownloadClick={downloadcredential}
            onScannerDeleteClick={delete_func}
            onScannerDownloadClick={download}
            onScannerEditClick={edit}
            onScannerSaveClick={save}
            onScannerVerifyClick={verify}
          />
        </React.Fragment>
      )}
    </ScannerComponent>
  );
};

ScannersPage.propTypes = {
  showSuccess: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('scanner', {
  entitiesSelector,
  loadEntities,
})(ScannersPage);
