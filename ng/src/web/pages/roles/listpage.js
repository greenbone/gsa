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

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import {ROLES_FILTER_FILTER} from 'gmp/models/filter.js';

import RoleComponent from './component.js';
import Table, {SORT_FIELDS} from './table.js';

const ToolBarIcons = ({
  onRoleCreateClick,
}, {capabilities}) => (
  <IconDivider>
    <ManualIcon
      page="gui_administration"
      anchor="user-roles"
      title={_('Help: Roles')}/>
    {capabilities.mayCreate('role') &&
      <NewIcon
        title={_('New Role')}
        onClick={onRoleCreateClick}/>
    }
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onRoleCreateClick: PropTypes.func.isRequired,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

const RolesFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const RolesPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <RoleComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >{({
    clone,
    create,
    delete: delete_func,
    download,
    edit,
    save,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={RolesFilterDialog}
      sectionIcon="role.svg"
      table={Table}
      title={_('Roles')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onRoleCloneClick={clone}
      onRoleCreateClick={create}
      onRoleDeleteClick={delete_func}
      onRoleDownloadClick={download}
      onRoleEditClick={edit}
      onRoleSaveClick={save}
    />
  )}
  </RoleComponent>
);

RolesPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('role', {
  filtersFilter: ROLES_FILTER_FILTER,
})(RolesPage);

// vim: set ts=2 sw=2 tw=80:
