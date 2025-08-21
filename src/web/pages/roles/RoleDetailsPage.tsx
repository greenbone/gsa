/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate} from 'react-router';
import Gmp from 'gmp/gmp';
import Filter from 'gmp/models/filter';
import Permission from 'gmp/models/permission';
import Role from 'gmp/models/role';
import {RoleIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import EntityPermissions from 'web/entity/EntityPermissions';
import {OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsSubjectFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import RoleComponent from 'web/pages/roles/RoleComponent';
import RoleDetails from 'web/pages/roles/RoleDetails';
import RoleDetailsPageToolBarIcons from 'web/pages/roles/RoleDetailsPageToolBarIcons';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/roles';
import {
  permissionDescription,
  simplePermissionDescription,
} from 'web/utils/Render';

interface RoleDetailsPageProps {
  entity: Role;
  generalPermissions?: Permission[];
  isLoading?: boolean;
  links?: boolean;
  permissions?: Permission[];
  onError: (error: Error) => void;
  onChanged: () => void;
  onDownloaded?: OnDownloadedFunc;
}

interface DetailsProps {
  entity: Role;
}

interface GeneralPermissionsProps {
  permissions?: Permission[];
  links?: boolean;
}

const Details = ({entity}: DetailsProps) => {
  return (
    <Layout flex="column">
      <RoleDetails entity={entity} />
    </Layout>
  );
};

const GeneralPermissions = ({
  permissions = [],
  links,
}: GeneralPermissionsProps) => {
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
                    {perm.resource
                      ? permissionDescription(
                          perm.name,
                          {
                            name: perm.resource.name || '',
                            entityType: perm.resource.entityType || '',
                          },
                          undefined,
                        )
                      : simplePermissionDescription(perm.name || '')}
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

const RoleDetailsPage = ({
  entity,
  generalPermissions = [],
  isLoading = true,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
}: RoleDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <RoleComponent
      onCloneError={onError}
      onCloned={goToDetails('role', navigate)}
      onCreated={goToDetails('role', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('roles', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <EntityPage<Role>
          entity={entity}
          entityType="role"
          isLoading={isLoading}
          sectionIcon={<RoleIcon size="large" />}
          title={_('Role')}
          toolBarIcons={
            <RoleDetailsPageToolBarIcons
              entity={entity}
              onRoleCloneClick={clone}
              onRoleCreateClick={create}
              onRoleDeleteClick={deleteFunc}
              onRoleDownloadClick={download}
              onRoleEditClick={edit}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Role: {{name}}', {name: entity.name || ''})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
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

                  <Tabs>
                    <TabPanels>
                      <TabPanel>
                        <Details entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <GeneralPermissions permissions={generalPermissions} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
                          onError={onError}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions<Role>
                          entity={entity}
                          permissions={permissions}
                          onChanged={onChanged}
                          onDownloaded={onDownloaded}
                          onError={onError}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabsContainer>
              </>
            );
          }}
        </EntityPage>
      )}
    </RoleComponent>
  );
};

const generalPermissionsFilter = (id: string) =>
  Filter.fromString('subject_uuid=' + id + ' and resource_uuid=""').all();

const load = (gmp: Gmp) => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return (id: string) => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsSubjectFilter(id))),
      dispatch(loadPermissionsFunc(generalPermissionsFilter(id))),
    ]);
};

const mapStateToProps = (rootState: unknown, {id}: {id: string}) => {
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
})(RoleDetailsPage);
