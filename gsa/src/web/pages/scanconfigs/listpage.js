/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer2';

import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';

import ScanConfigComponent from './component';
import Table, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onScanConfigCreateClick,
  onScanConfigImportClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="scan-configuration"
      title={_('Help: Scan Configs')}
    />
    {capabilities.mayCreate('config') &&
      <NewIcon
        title={_('New Scan Config')}
        onClick={onScanConfigCreateClick}
      />
    }
    {capabilities.mayCreate('config') &&
      <Icon
        img="upload.svg"
        title={_('Import Scan Config')}
        onClick={onScanConfigImportClick}
      />
    }
  </IconDivider>
));

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
    onSaved={onChanged}
    onImported={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      import: import_func,
    }) => (
      <EntitiesPage
        {...props}
        filterEditDialog={ScanConfigFilterDialog}
        sectionIcon="config.svg"
        table={Table}
        title={_('Scan Configs')}
        toolBarIcons={ToolBarIcons}
        onError={onError}
        onScanConfigImportClick={import_func}
        onScanConfigCloneClick={clone}
        onScanConfigCreateClick={create}
        onScanConfigDeleteClick={delete_func}
        onScanConfigDownloadClick={download}
        onScanConfigEditClick={edit}
      />
    )}
  </ScanConfigComponent>
);

ScanConfigsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('scanconfig', {
  entitiesSelector,
  filtersFilter: SCANCONFIGS_FILTER_FILTER,
  loadEntities,
})(ScanConfigsPage);

// vim: set ts=2 sw=2 tw=80:
