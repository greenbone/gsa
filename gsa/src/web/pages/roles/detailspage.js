/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import EntityNameTableData from 'web/entities/entitynametabledata';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import EntityPage from 'web/entity/page';
import EntityContainer, {
  loader,
  permissions_subject_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
import {permissionDescription} from 'web/utils/render';

import RoleComponent from './component';
import RoleDetails from './details';
import EntityPermissions from 'web/entity/permissions';

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
      <ManualIcon
        page="gui_administration"
        anchor="user-roles"
        title={_('Help: Roles')}
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
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  general_permissions: PropTypes.object,
  links: PropTypes.bool,
};

const GeneralPermissions = ({
  permissions = [],
  links,
}) => {
  return (
    <Layout
      title={_('General Command Permissions')}
    >
      {permissions.length > 0 ?
        <Table>
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
            {permissions.map(perm => (
              <TableRow key={perm.id}>
                <EntityNameTableData
                  entity={perm}
                  links={links}
                  type="permission"
                  displayName={_('Permission')}
                />
                <TableData>
                  {permissionDescription(perm.name, perm.resource)}
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table> :
        _('None')
      }
    </Layout>
  );
};

GeneralPermissions.propTypes = {
  links: PropTypes.bool,
  permissions: PropTypes.array,
};

const Page = ({
  entity,
  links = true,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onTagAddClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagEditClick,
  onTagEnableClick,
  onTagRemoveClick,
  general_permissions = {entities: []},
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
        entity={entity}
        sectionIcon="role.svg"
        title={_('Role')}
        toolBarIcons={ToolBarIcons}
        onRoleCloneClick={clone}
        onRoleCreateClick={create}
        onRoleDeleteClick={delete_func}
        onRoleDownloadClick={download}
        onRoleEditClick={edit}
        onRoleSaveClick={save}
      >
        {({
          activeTab = 0,
          onActivateTab,
        }) => {
          return (
            <Layout grow="1" flex="column">
              <TabLayout
                grow="1"
                align={['start', 'end']}
              >
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={onActivateTab}
                >
                  <Tab>
                    {_('Information')}
                  </Tab>
                  <EntitiesTab entities={general_permissions}>
                    {_('General Command Permissions')}
                  </EntitiesTab>
                  <EntitiesTab entities={entity.userTags}>
                    {_('User Tags')}
                  </EntitiesTab>
                  <EntitiesTab entities={permissions}>
                    {_('Permissions')}
                  </EntitiesTab>
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Details
                      entity={entity}
                      links={links}
                    />
                  </TabPanel>
                  <TabPanel>
                    <GeneralPermissions
                      permissions={general_permissions}
                    />
                  </TabPanel>
                  <TabPanel>
                    <EntityTags
                      entity={entity}
                      onTagAddClick={onTagAddClick}
                      onTagDeleteClick={onTagDeleteClick}
                      onTagDisableClick={onTagDisableClick}
                      onTagEditClick={onTagEditClick}
                      onTagEnableClick={onTagEnableClick}
                      onTagCreateClick={onTagCreateClick}
                      onTagRemoveClick={onTagRemoveClick}
                    />
                  </TabPanel>
                  <TabPanel>
                    <EntityPermissions
                      entity={entity}
                      permissions={permissions}
                      onChanged={onChanged}
                      onDownloaded={onDownloaded}
                      onError={onError}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Layout>
          );
        }}
      </EntityPage>
    )}
  </RoleComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  general_permissions: PropTypes.array,
  links: PropTypes.bool,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

const general_permissions_loader = loader('permissions',
  id => 'subject_uuid=' + id, 'general_permissions');

const RolePage = props => (
  <EntityContainer
    {...props}
    name="role"
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
