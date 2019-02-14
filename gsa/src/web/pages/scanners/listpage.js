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

import {SCANNERS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page.js';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScannerIcon from 'web/components/icon/scannericon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanners';

import ScannerComponent from './component';
import ScannersTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(
  ({capabilities, onScannerCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="search"
        searchTerm="scanner"
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
    onVerified={onChanged}
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
    )}
  </ScannerComponent>
);

ScannersPage.propTypes = {
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
