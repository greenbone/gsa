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

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import Table, {SORT_FIELDS} from './table';

import PermissionComponent from './component';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onPermissionCreateClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="gui_administration"
      anchor="permissions"
      title={_('Help: Permissions')}
    />
    {capabilities.mayCreate('permission') &&
      <NewIcon
        title={_('New Permission')}
        onClick={onPermissionCreateClick}
      />
    }

  </IconDivider>
));

ToolBarIcons.propTypes = {
  onPermissionCreateClick: PropTypes.func,
};

const FilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <PermissionComponent
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onSaved={onChanged}
    onSaveError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
    }) => (
      <EntitiesPage
        {...props}
        sectionIcon="permission.svg"
        table={Table}
        filterEditDialog={FilterDialog}
        title={_('Permissions')}
        toolBarIcons={ToolBarIcons}
        onError={onError}
        onPermissionCloneClick={clone}
        onPermissionCreateClick={create}
        onPermissionDeleteClick={delete_func}
        onPermissionDownloadClick={download}
        onPermissionEditClick={edit}
      />
    )}
  </PermissionComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('permission')(Page);

// vim: set ts=2 sw=2 tw=80:
