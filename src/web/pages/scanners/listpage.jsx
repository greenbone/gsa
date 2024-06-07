/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {SCANNERS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScannerIcon from 'web/components/icon/scannericon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanners';

import useGmp from 'web/utils/useGmp';

import ScannerComponent from './component';
import ScannersTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(
  ({capabilities, onScannerCreateClick}) => {
    const gmp = useGmp();
    return (
      <IconDivider>
        <ManualIcon
          page="scanning"
          anchor="managing-scanners"
          title={_('Help: Scanners')}
        />
        {capabilities.mayCreate('scanner') &&
          gmp.settings.enableGreenboneSensor && (
            <NewIcon title={_('New Scanner')} onClick={onScannerCreateClick} />
          )}
      </IconDivider>
    );
  },
);

ToolBarIcons.propTypes = {
  onScannerCreateClick: PropTypes.func.isRequired,
};

const ScannersFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const ScannersPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  showSuccess,
  ...props
}) => (
  <ScannerComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCertificateDownloadError={onError}
    onCertificateDownloaded={onDownloaded}
    onCloned={onChanged}
    onCloneError={onError}
    onCredentialDownloaded={onDownloaded}
    onCredentialDownloadError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
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

// vim: set ts=2 sw=2 tw=80:
