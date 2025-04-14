/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import {DisableIcon, EnableIcon, TagIcon} from 'web/components/icon';
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
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import TagComponent from 'web/pages/tags/Component';
import TagDetails from 'web/pages/tags/Details';
import ResourceList from 'web/pages/tags/ResourceList';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/tags';
import PropTypes from 'web/utils/PropTypes';
import withCapabilties from 'web/utils/withCapabilities';
const ToolBarIcons = withCapabilties(
  ({
    capabilities,
    entity,
    onTagCloneClick,
    onTagCreateClick,
    onTagDeleteClick,
    onTagDisableClick,
    onTagDownloadClick,
    onTagEditClick,
    onTagEnableClick,
  }) => {
    let endisableable = null;

    if (capabilities.mayEdit('tag')) {
      if (entity.isActive()) {
        endisableable = (
          <DisableIcon
            title={_('Disable Tag')}
            value={entity}
            onClick={onTagDisableClick}
          />
        );
      } else {
        endisableable = (
          <EnableIcon
            title={_('Enable Tag')}
            value={entity}
            onClick={onTagEnableClick}
          />
        );
      }
    }
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
          {endisableable}
        </IconDivider>
      </Divider>
    );
  },
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCloneClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagDownloadClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  return (
    <TagComponent
      onCloneError={onError}
      onCloned={goToDetails('tag', props)}
      onCreated={goToDetails('tag', props)}
      onDeleteError={onError}
      onDeleted={goToList('tags', props)}
      onDisableError={onError}
      onDisabled={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onEnableError={onError}
      onEnabled={onChanged}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        enable,
        disable,
        save,
        remove,
      }) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<TagIcon size="large" />}
          title={_('Tag')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onTagCloneClick={clone}
          onTagCreateClick={create}
          onTagDeleteClick={delete_func}
          onTagDisableClick={disable}
          onTagDownloadClick={download}
          onTagEditClick={edit}
          onTagEnableClick={enable}
          onTagRemoveClick={remove}
          onTagSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Tag: {{name}}', {name: entity.name})} />
                <Layout flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab count={entity.resourceCount}>
                        {_('Assigned Items')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
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
    </TagComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
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

// vim: set ts=2 sw=2 tw=80:
