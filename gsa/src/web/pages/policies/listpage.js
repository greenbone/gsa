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

import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import PolicyIcon from 'web/components/icon/policyicon';
import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';

import PoliciesComponent from './component';
import Table, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(
  ({capabilities, onPolicyCreateClick, onPolicyImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="scan-configuration"
        title={_('Help: Policies')}
      />
      {capabilities.mayCreate('config') && (
        <NewIcon title={_('New Policy')} onClick={onPolicyCreateClick} />
      )}
      {capabilities.mayCreate('config') && (
        <UploadIcon title={_('Import Policy')} onClick={onPolicyImportClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onPolicyCreateClick: PropTypes.func.isRequired,
  onPolicyImportClick: PropTypes.func.isRequired,
};

const ScanConfigFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const PoliciesPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <PoliciesComponent
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
      createAudit,
      delete: delete_func,
      download,
      edit,
      import: import_func,
    }) => (
      <EntitiesPage
        {...props}
        filterEditDialog={ScanConfigFilterDialog}
        filtersFilter={SCANCONFIGS_FILTER_FILTER}
        sectionIcon={<PolicyIcon size="large" />}
        table={Table}
        title={_('Policies')}
        toolBarIcons={ToolBarIcons}
        onError={onError}
        onInteraction={onInteraction}
        onPolicyImportClick={import_func}
        onPolicyCloneClick={clone}
        onPolicyCreateClick={create}
        onCreateAuditClick={createAudit}
        onPolicyDeleteClick={delete_func}
        onPolicyDownloadClick={download}
        onPolicyEditClick={edit}
      />
    )}
  </PoliciesComponent>
);

PoliciesPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('scanconfig', {
  entitiesSelector,
  loadEntities,
})(PoliciesPage);

// vim: set ts=2 sw=2 tw=80:
