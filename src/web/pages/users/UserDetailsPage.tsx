/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router';
import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import type User from 'gmp/models/user';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {UserIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
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
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import {useGetPermissions} from 'web/hooks/use-query/permissions';
import {useGetUser} from 'web/hooks/use-query/users';
import useTranslation from 'web/hooks/useTranslation';
import UserComponent from 'web/pages/users/UserComponent';
import UserDetails from 'web/pages/users/UserDetails';

interface ToolBarIconsProps {
  entity: User;
  onUserCloneClick: (user: User) => void | Promise<void>;
  onUserCreateClick: () => void | Promise<void>;
  onUserDeleteClick: (user: User) => void | Promise<void>;
  onUserDownloadClick: (user: User) => void | Promise<void>;
  onUserEditClick: (user: User) => void | Promise<void>;
}

const permissionsSubjectFilter = (id: string): FilterType =>
  QueryFilter.fromString(
    'subject_uuid=' +
      id +
      ' and not resource_uuid=""' +
      ' or resource_uuid=' +
      id,
  ).all();

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

const UserDetailPage = () => {
  const [_] = useTranslation();
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();

  const {data: entity, isLoading} = useGetUser({id: id ?? ''});

  const permFilter = permissionsSubjectFilter(id ?? '');
  const {data: permissionsData} = useGetPermissions({
    filter: permFilter,
    enabled: Boolean(id),
  });

  const permissions = permissionsData?.entities ?? [];

  const onChanged = () => {
    void queryClient.invalidateQueries({queryKey: ['get_user']});
    void queryClient.invalidateQueries({queryKey: ['get_permissions']});
  };

  const onError = (error: Error) => {
    showError(error);
  };

  const onDownloaded = handleDownload;

  if (!entity) {
    return (
      <EntityPage<User>
        entity={undefined as unknown as User}
        entityType="user"
        isLoading={isLoading}
        sectionIcon={<UserIcon size="large" />}
        title={_('User')}
        toolBarIcons={<div />}
      >
        {() => null}
      </EntityPage>
    );
  }

  return (
    <>
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
      <Download ref={downloadRef} />
      <UserComponent
        onCloneError={onError}
        onCloned={(response: unknown) => {
          const id = (response as {id: string}).id;
          goToDetails('user', navigate)({data: {id}});
        }}
        onCreated={(response: unknown) => {
          const id = (response as {id: string}).id;
          goToDetails('user', navigate)({data: {id}});
        }}
        onDeleteError={onError}
        onDeleted={goToList('users', navigate)}
        onDownloadError={onError}
        onDownloaded={onDownloaded}
        onSaved={onChanged}
      >
        {({clone, create, delete: deleteFunc, download, edit}) => (
          <EntityPage<User>
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
              const tabs = [
                {
                  label: _('Information'),
                  panel: <UserDetails entity={entity} />,
                },
                {
                  label: _('User Tags'),
                  entities: entity.userTags,
                  panel: (
                    <EntityTags
                      entity={entity}
                      onChanged={onChanged}
                      onError={onError}
                    />
                  ),
                },
                {
                  label: _('Permissions'),
                  entities: permissions,
                  panel: (
                    <EntityPermissions
                      entity={entity}
                      permissions={permissions}
                      onChanged={onChanged}
                      onDownloaded={onDownloaded}
                      onError={onError}
                    />
                  ),
                },
              ];

              return (
                <>
                  <PageTitle
                    title={_('User: {{name}}', {name: entity.name as string})}
                  />
                  <TabsContainer flex="column" grow="1">
                    <TabLayout align={['start', 'end']} grow="1">
                      <TabList align={['start', 'stretch']}>
                        {tabs.map(({label, entities}) =>
                          entities === undefined ? (
                            <Tab key={label}>{label}</Tab>
                          ) : (
                            <EntitiesTab key={label} entities={entities}>
                              {label}
                            </EntitiesTab>
                          ),
                        )}
                      </TabList>
                    </TabLayout>

                    <Tabs>
                      <TabPanels>
                        {tabs.map(({label, panel}) => (
                          <TabPanel key={label}>{panel}</TabPanel>
                        ))}
                      </TabPanels>
                    </Tabs>
                  </TabsContainer>
                </>
              );
            }}
          </EntityPage>
        )}
      </UserComponent>
    </>
  );
};

export default UserDetailPage;
