/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate} from 'react-router';
import Permission from 'gmp/models/permission';
import {PermissionIcon} from 'web/components/icon';
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
import {OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import PermissionComponent from 'web/pages/permissions/PermissionComponent';
import PermissionDetails from 'web/pages/permissions/PermissionDetails';
import {selector, loadEntity} from 'web/store/entities/permissions';

interface PermissionDetailsPageToolBarIconsProps {
  entity: Permission;
  onPermissionCloneClick?: (entity: Permission) => void;
  onPermissionCreateClick?: () => void;
  onPermissionDeleteClick?: (entity: Permission) => void;
  onPermissionDownloadClick?: (entity: Permission) => void;
  onPermissionEditClick?: (entity: Permission) => void;
}

interface PermissionDetailsPageProps {
  entity: Permission;
  isLoading?: boolean;
  onChanged: () => void;
  onDownloaded?: OnDownloadedFunc;
  onError: (error: Error) => void;
}

export const PermissionsDetailsPageToolBarIcons = ({
  entity,
  onPermissionCloneClick,
  onPermissionCreateClick,
  onPermissionDeleteClick,
  onPermissionDownloadClick,
  onPermissionEditClick,
}: PermissionDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-permissions"
          page="web-interface-access"
          title={_('Help: Permissions')}
        />
        <ListIcon page="permissions" title={_('Permission List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onPermissionCreateClick} />
        <CloneIcon entity={entity} onClick={onPermissionCloneClick} />
        <EditIcon entity={entity} onClick={onPermissionEditClick} />
        <TrashIcon entity={entity} onClick={onPermissionDeleteClick} />
        <ExportIcon
          title={_('Export Permission as XML')}
          value={entity}
          onClick={onPermissionDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

const PermissionsDetailsPage = ({
  entity,
  isLoading = true,
  onChanged,
  onDownloaded,
  onError,
}: PermissionDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <PermissionComponent
      onCloneError={onError}
      onCloned={goToDetails('permission', navigate)}
      onCreated={goToDetails('permission', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('permissions', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <EntityPage<Permission>
          entity={entity}
          entityType="permission"
          isLoading={isLoading}
          sectionIcon={<PermissionIcon size="large" />}
          title={_('Permission')}
          toolBarIcons={
            <PermissionsDetailsPageToolBarIcons
              entity={entity}
              onPermissionCloneClick={clone}
              onPermissionCreateClick={create}
              onPermissionDeleteClick={deleteFunc}
              onPermissionDownloadClick={download}
              onPermissionEditClick={edit}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Permission: {{name}}', {
                    name: entity.name as string,
                  })}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs>
                    <TabPanels>
                      <TabPanel>
                        <PermissionDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
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
    </PermissionComponent>
  );
};

const mapStateToProps = () => {
  return {};
};

export default withEntityContainer('permission', {
  entitySelector: selector,
  load: loadEntity,
  mapStateToProps,
})(PermissionsDetailsPage);
