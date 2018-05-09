/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {SCANNERS_FILTER_FILTER} from 'gmp/models/filter.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import ScannerComponent from './component.js';
import ScannersTable, {SORT_FIELDS} from './table.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onScannerCreateClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="search"
      searchTerm="scanner"
      title={_('Help: Scanners')}
    />
    {capabilities.mayCreate('scanner') &&
      <NewIcon
        title={_('New Scanner')}
        onClick={onScannerCreateClick}
      />
    }
  </IconDivider>
));

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
    onVerified={onChanged}
    onVerifyError={onError}
  >{({
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
      sectionIcon="scanner.svg"
      table={ScannersTable}
      title={_('Scanners')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
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
};

export default withEntitiesContainer('scanner', {
  filtersFilter: SCANNERS_FILTER_FILTER,
})(ScannersPage);

// vim: set ts=2 sw=2 tw=80:
