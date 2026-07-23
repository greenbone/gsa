/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Gmp from 'gmp/gmp';
import type Permission from 'gmp/models/permission';
import type User from 'gmp/models/user';
import {UserIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import EntityPermissions from 'web/entity/EntityPermissions';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import {goToDetails, goToList, type NavigateFunc} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsSubjectFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import UserDetails from 'web/pages/users/Details';
import UserComponent from 'web/pages/users/UserComponent';
import {
  loadEntities as loadPermissions,
  selector as permissionsSelector,
} from 'web/store/entities/permissions';
import {loadEntity, selector} from 'web/store/entities/users';

interface ToolBarIconsProps {
  entity: User;
  onUserCloneClick: (user: User) => void | Promise<void>;
  onUserCreateClick: () => void | Promise<void>;
  onUserDeleteClick: (user: User) => void | Promise<void>;
  onUserDownloadClick: (user: User) => void | Promise<void>;
  onUserEditClick: (user: User) => void | Promise<void>;
}

interface PageProps {
  entity: User;
  isLoading?: boolean;
  permissions?: Permission[];
  navigate: NavigateFunc;
  onChanged: () => void;
  onDownloaded?: OnDownloadedFunc;
  onError: (error: Error) => void;
}

const ToolBarIcons = ({
  entity,
  onUserCloneClick,
  onUserCreateClick,
  onUserDeleteClick,
  onUserDownloadClick,
  onUserEditClick,
}: ToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-users"
          page="web-interface-access"
          title={_('Help: Users')}
        />
        <ListIcon page="users" title={_('Users List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onUserCreateClick} />
        <CloneIcon
          entity={entity}
          mayClone={!entity.isSuperAdmin()}
          onClick={onUserCloneClick}
        />
        <EditIcon entity={entity} onClick={onUserEditClick} />
        <DeleteIcon entity={entity} onClick={onUserDeleteClick} />
        <ExportIcon
          title={_('Export User as XML')}
          value={entity}
          onClick={onUserDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

const Page = ({
  entity,
  isLoading = true,
  permissions = [],
  navigate,
  onChanged,
  onDownloaded,
  onError,
  ...otherProps
}: PageProps) => {
  const [_] = useTranslation();

  return (
    <UserComponent
      onCloneError={onError}
      onCloned={(response: unknown) =>
        goToDetails('user', navigate)(response as {data: {id: string}})
      }
      onCreated={(response: unknown) =>
        goToDetails('user', navigate)(response as {data: {id: string}})
      }
      onDeleteError={onError}
      onDeleted={goToList('users', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <EntityPage
          {...otherProps}
          entity={entity}
          isLoading={isLoading}
          sectionIcon={<UserIcon size="large" />}
          title={_('User')}
          toolBarIcons={
            <ToolBarIcons
              entity={entity}
              onUserCloneClick={clone}
              onUserCreateClick={create}
              onUserDeleteClick={deleteFunc}
              onUserDownloadClick={download}
              onUserEditClick={edit}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('User: {{name}}', {name: entity.name ?? ''})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
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
                        <UserDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
                          onError={onError}
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
                </TabsContainer>
              </>
            );
          }}
        </EntityPage>
      )}
    </UserComponent>
  );
};

const load = (gmp: Gmp) => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return (id: string) => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsSubjectFilter(id))),
    ]);
};

const mapStateToProps = (rootState: unknown, {id}: {id: string}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsSubjectFilter(id)),
  };
};

export default withEntityContainer('user', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
