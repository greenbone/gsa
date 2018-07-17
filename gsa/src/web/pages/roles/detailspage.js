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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {permissionDescription} from '../../utils/render.js';

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
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import RoleComponent from './component.js';
import RoleDetails from './details.js';

const TabTitleCount = glamorous.span({
  fontSize: '0.7em',
});

const TabTitle = ({title, count}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCount>(<i>{(count)}</i>)</TabTitleCount>
  </Layout>
);

TabTitle.propTypes = {
  count: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

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
  onChanged,
  onDownloaded,
  onError,
  general_permissions,
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
      >
        {({
          activeTab = 0,
          links = true,
          permissionsComponent,
          permissionsTitle,
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
        }) => {
          const genPermsCount = is_defined(general_permissions) ?
            general_permissions.entities.length : 0;

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
                  <Tab>
                    <TabTitle
                      title={_('General Command Permissions')}
                      count={genPermsCount}
                    />
                  </Tab>
                  {is_defined(tagsComponent) &&
                    <Tab>
                      {tagsTitle}
                    </Tab>
                  }
                  {is_defined(permissionsComponent) &&
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  }
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
                      permissions={is_defined(general_permissions) ?
                        general_permissions.entities : []}
                    />
                  </TabPanel>
                  {is_defined(tagsComponent) &&
                    <TabPanel>
                      {tagsComponent}
                    </TabPanel>
                  }
                  {is_defined(permissionsComponent) &&
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  }
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
  general_permissions: PropTypes.object,
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
