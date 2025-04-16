/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import React from 'react';
import {RoleIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsSubjectFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import RoleComponent from 'web/pages/roles/Component';
import RoleDetails from 'web/pages/roles/Details';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/roles';
import PropTypes from 'web/utils/PropTypes';
import {permissionDescription} from 'web/utils/Render';
const ToolBarIcons = ({
  entity,
  onRoleCloneClick,
  onRoleCreateClick,
  onRoleDeleteClick,
  onRoleDownloadClick,
  onRoleEditClick,
}) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-roles"
          page="web-interface-access"
          title={_('Help: Roles')}
        />
        <ListIcon page="roles" title={_('Roles List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onRoleCreateClick} />
        <CloneIcon entity={entity} onClick={onRoleCloneClick} />
        <EditIcon entity={entity} onClick={onRoleEditClick} />
        <TrashIcon entity={entity} onClick={onRoleDeleteClick} />
        <ExportIcon
          title={_('Export Role as XML')}
          value={entity}
          onClick={onRoleDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onRoleCloneClick: PropTypes.func.isRequired,
  onRoleCreateClick: PropTypes.func.isRequired,
  onRoleDeleteClick: PropTypes.func.isRequired,
  onRoleDownloadClick: PropTypes.func.isRequired,
  onRoleEditClick: PropTypes.func.isRequired,
};

const Details = ({entity, links}) => {
  return (
    <Layout flex="column">
      <RoleDetails entity={entity} links={links} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const GeneralPermissions = ({permissions = [], links}) => {
  const [_] = useTranslation();
  return (
    <Layout title={_('General Command Permissions')}>
      {permissions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Name')}</TableHead>
              <TableHead>{_('Description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map(perm => {
              return (
                <TableRow key={perm.id}>
                  <EntityNameTableData
                    displayName={_('Permission')}
                    entity={perm}
                    links={links}
                    type="permission"
                  />
                  <TableData>
                    {permissionDescription(perm.name, perm.resource)}
                  </TableData>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        _('None')
      )}
    </Layout>
  );
};

GeneralPermissions.propTypes = {
  links: PropTypes.bool,
  permissions: PropTypes.array,
};

const Page = ({
  entity,
  generalPermissions = [],
  links = true,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <RoleComponent
      onCloneError={onError}
      onCloned={goToDetails('role', props)}
      onCreated={goToDetails('role', props)}
      onDeleteError={onError}
      onDeleted={goToList('roles', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<RoleIcon size="large" />}
          title={_('Role')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onRoleCloneClick={clone}
          onRoleCreateClick={create}
          onRoleDeleteClick={delete_func}
          onRoleDownloadClick={download}
          onRoleEditClick={edit}
          onRoleSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Role: {{name}}', {name: entity.name})} />
                <Layout flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={generalPermissions}>
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
                        <Details entity={entity} links={links} />
                      </TabPanel>
                      <TabPanel>
                        <GeneralPermissions permissions={generalPermissions} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
                          onError={onError}
                          onInteraction={onInteraction}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={entity}
                          permissions={permissions}
                          onChanged={onChanged}
                          onDownloaded={onDownloaded}
                          onError={onError}
                          onInteraction={onInteraction}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Layout>
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </RoleComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  generalPermissions: PropTypes.array,
  links: PropTypes.bool,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const generalPermissionsFilter = id =>
  Filter.fromString('subject_uuid=' + id + ' and resource_uuid=""').all();

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsSubjectFilter(id))),
      dispatch(loadPermissionsFunc(generalPermissionsFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsSubjectFilter(id)),
    generalPermissions: permissionsSel.getEntities(
      generalPermissionsFilter(id),
    ),
  };
};

export default withEntityContainer('role', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
