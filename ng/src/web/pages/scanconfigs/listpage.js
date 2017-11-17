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

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import ScanConfigComponent from './component.js';
import Table, {SORT_FIELDS} from './table.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onScanConfigCreateClick,
  onScanConfigImportClick,
}) => (
  <IconDivider>
    <HelpIcon
      page="configs"
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
        foldable={true}
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
})(ScanConfigsPage);

// vim: set ts=2 sw=2 tw=80:
