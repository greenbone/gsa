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

import {ROLES_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import RoleIcon from 'web/components/icon/roleicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/roles';

import RoleComponent from './component';
import Table, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({capabilities, onRoleCreateClick}) => (
  <IconDivider>
    <ManualIcon
      page="gui_administration"
      anchor="user-roles"
      title={_('Help: Roles')}
    />
    {capabilities.mayCreate('role') && (
      <NewIcon title={_('New Role')} onClick={onRoleCreateClick} />
    )}
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onRoleCreateClick: PropTypes.func.isRequired,
};

const RolesFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const RolesPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
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
    onInteraction={onInteraction}
  >
    {({clone, create, delete: delete_func, download, edit, save}) => (
      <EntitiesPage
        {...props}
        filterEditDialog={RolesFilterDialog}
        filtersFilter={ROLES_FILTER_FILTER}
        sectionIcon={<RoleIcon size="large" />}
        table={Table}
        title={_('Roles')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onInteraction={onInteraction}
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
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('role', {
  entitiesSelector,
  loadEntities,
})(RolesPage);

// vim: set ts=2 sw=2 tw=80:
