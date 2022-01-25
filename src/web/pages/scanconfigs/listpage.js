/* Copyright (C) 2017-2022 Greenbone Networks GmbH
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

import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';

import PageTitle from 'web/components/layout/pagetitle';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';

import ScanConfigComponent from './component';
import Table, {SORT_FIELDS} from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onScanConfigCreateClick, onScanConfigImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-scan-configurations"
        title={_('Help: Scan Configs')}
      />
      {capabilities.mayCreate('config') && (
        <NewIcon
          title={_('New Scan Config')}
          onClick={onScanConfigCreateClick}
        />
      )}
      {capabilities.mayCreate('config') && (
        <UploadIcon
          title={_('Import Scan Config')}
          onClick={onScanConfigImportClick}
        />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onScanConfigCreateClick: PropTypes.func.isRequired,
  onScanConfigImportClick: PropTypes.func.isRequired,
};

const ScanConfigFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const ScanConfigsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <ScanConfigComponent
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onImported={onChanged}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      import: import_func,
    }) => (
      <React.Fragment>
        <PageTitle title={_('Scan Configs')} />
        <EntitiesPage
          {...props}
          filterEditDialog={ScanConfigFilterDialog}
          filtersFilter={SCANCONFIGS_FILTER_FILTER}
          sectionIcon={<ScanConfigIcon size="large" />}
          table={Table}
          title={_('Scan Configs')}
          toolBarIcons={ToolBarIcons}
          onError={onError}
          onInteraction={onInteraction}
          onScanConfigImportClick={import_func}
          onScanConfigCloneClick={clone}
          onScanConfigCreateClick={create}
          onScanConfigDeleteClick={delete_func}
          onScanConfigDownloadClick={download}
          onScanConfigEditClick={edit}
        />
      </React.Fragment>
    )}
  </ScanConfigComponent>
);

ScanConfigsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('scanconfig', {
  entitiesSelector,
  loadEntities,
})(ScanConfigsPage);

// vim: set ts=2 sw=2 tw=80:
