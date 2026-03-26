/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useNavigate} from 'react-router';
import type Permission from 'gmp/models/permission';
import type Tag from 'gmp/models/tag';
import {DisableIcon, EnableIcon, TagIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import Loading from 'web/components/loading/Loading';
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
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import TagDetails from 'web/pages/tags/Details';
import ResourceList from 'web/pages/tags/ResourceList';
import TagComponent from 'web/pages/tags/TagComponent';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/tags';

interface ToolBarIconsProps {
  entity: Tag;
  onTagCloneClick?: (entity: Tag) => void;
  onTagCreateClick?: () => void;
  onTagDeleteClick?: (entity: Tag) => void;
  onTagDisableClick?: (entity: Tag) => void;
  onTagDownloadClick?: (entity: Tag) => void;
  onTagEditClick?: (entity: Tag) => void;
  onTagEnableClick?: (entity: Tag) => void;
}

interface PageProps {
  entity: Tag;
  permissions?: Permission[];
  onChanged: () => void;
  onDownloaded?: OnDownloadedFunc;
  onError: (error: Error) => void;
}

const ToolBarIcons = ({
  entity,
  onTagCloneClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagDownloadClick,
  onTagEditClick,
  onTagEnableClick,
}: ToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  const iconComponent = entity.isActive() ? (
    <DisableIcon
      title={_('Disable Tag')}
      value={entity}
      onClick={onTagDisableClick}
    />
  ) : (
    <EnableIcon
      title={_('Enable Tag')}
      value={entity}
      onClick={onTagEnableClick}
    />
  );

  const toggleIcon = capabilities.mayEdit('tag') ? iconComponent : null;
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-tags"
          page="web-interface"
          title={_('Help: Tags')}
        />
        <ListIcon page="tags" title={_('Tag List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onTagCreateClick} />
        <CloneIcon entity={entity} onClick={onTagCloneClick} />
        <EditIcon entity={entity} onClick={onTagEditClick} />
        <TrashIcon entity={entity} onClick={onTagDeleteClick} />
        <ExportIcon
          title={_('Export Tag as XML')}
          value={entity}
          onClick={onTagDownloadClick}
        />
        {toggleIcon}
      </IconDivider>
    </Divider>
  );
};

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
}: PageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();

  if (!entity) {
    return <Loading />;
  }

  return (
    <TagComponent
      onCloneError={onError}
      onCloned={goToDetails('tag', navigate)}
      onCreated={goToDetails('tag', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('tags', navigate)}
      onDisableError={onError}
      onDisabled={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onEnableError={onError}
      onEnabled={onChanged}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        edit,
        enable,
        disable,
      }) => (
        <EntityPage
          entity={entity}
          isLoading={false}
          sectionIcon={<TagIcon size="large" />}
          title={_('Tag')}
          toolBarIcons={
            <ToolBarIcons
              entity={entity}
              onTagCloneClick={clone}
              onTagCreateClick={create}
              onTagDeleteClick={deleteFunc}
              onTagDisableClick={disable}
              onTagDownloadClick={download}
              onTagEditClick={edit}
              onTagEnableClick={enable}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Tag: {{name}}', {name: entity.name ?? ''})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab count={entity.resourceCount}>
                        {_('Assigned Items')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs>
                    <TabPanels>
                      <TabPanel>
                        <TagDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <ResourceList entity={entity} />
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
    </TagComponent>
  );
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('tag', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
