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
import {permission_description} from '../../utils/render.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  loader,
  permissions_subject_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Section from '../../components/section/section.js';

import StripedTable from '../../components/table/strippedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import RoleComponent from './component.js';
import RoleDetails from './details.js';

const ToolBarIcons = ({
  entity,
  onRoleCloneClick,
  onRoleCreateClick,
  onRoleDeleteClick,
  onRoleDownloadClick,
  onRoleEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="role_details"
        title={_('Help: Role Details')}
      />
      <ListIcon
        title={_('Roles List')}
        page="roles"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onRoleCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onRoleCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onRoleEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onRoleDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Role as XML')}
        onClick={onRoleDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onRoleCloneClick: PropTypes.func.isRequired,
  onRoleCreateClick: PropTypes.func.isRequired,
  onRoleDeleteClick: PropTypes.func.isRequired,
  onRoleDownloadClick: PropTypes.func.isRequired,
  onRoleEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  general_permissions = [],
  links,
}) => {
  return (
    <Layout flex="column">
      <RoleDetails
        entity={entity}
        links={links}
      />

      <Section
        title={_('General Command Permissions')}
        foldable={true}
      >
        {general_permissions.length > 0 ?
          <StripedTable>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
                  {_('Description')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {general_permissions.map(perm => (
                <TableRow key={perm.id}>
                  <EntityNameTableData
                    legacy
                    entity={perm}
                    link={links}
                    type="permission"
                    displayName={_('Permission')}
                  />
                  <TableData>
                    {permission_description(perm.name, perm.resource)}
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </StripedTable> :
          _('None')
        }
      </Section>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  general_permissions: PropTypes.collection,
  links: PropTypes.bool,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <RoleComponent
    onCloned={goto_details('role', props)}
    onCloneError={onError}
    onCreated={goto_details('role', props)}
    onDeleted={goto_list('roles', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
    }) => (
      <EntityPage
        {...props}
        sectionIcon="role.svg"
        title={_('Role')}
        detailsComponent={Details}
        toolBarIcons={ToolBarIcons}
        onRoleCloneClick={clone}
        onRoleCreateClick={create}
        onRoleDeleteClick={delete_func}
        onRoleDownloadClick={download}
        onRoleEditClick={edit}
        onRoleSaveClick={save}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </RoleComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const general_permissions_loader = loader('permissions',
  id => 'subject_uuid=' + id, 'general_permissions');

const RolePage = props => (
  <EntityContainer
    {...props}
    name="role"
    loadPermissions={false}
    loaders={[
      general_permissions_loader,
      permissions_subject_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default RolePage;

// vim: set ts=2 sw=2 tw=80:
