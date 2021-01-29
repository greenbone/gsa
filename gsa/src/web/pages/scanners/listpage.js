/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {SCANNERS_FILTER_FILTER} from 'gmp/models/filter';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScannerIcon from 'web/components/icon/scannericon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanners';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ScannerComponent from './component';
import ScannersTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(
  ({capabilities, onScannerCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-scanners"
        title={_('Help: Scanners')}
      />
      {capabilities.mayCreate('scanner') && (
        <NewIcon title={_('New Scanner')} onClick={onScannerCreateClick} />
      )}
    </IconDivider>
  ),
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
