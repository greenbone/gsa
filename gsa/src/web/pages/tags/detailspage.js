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

import glamorous from 'glamorous';

import PropTypes from 'web/utils/proptypes';
import withCapabilties from 'web/utils/withCapabilities';

import EntityPage from 'web/entity/page';
import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import ResourceList from 'web/pages/tags/resourcelist';
import TagComponent from 'web/pages/tags/component';
import TagDetails from 'web/pages/tags/details';

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
  count: PropTypes.numberOrNumberString.isRequired,
  title: PropTypes.string.isRequired,
};

const ToolBarIcons = withCapabilties(({
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
        <Icon
          img="disable.svg"
          value={entity}
          title={_('Disable Tag')}
          onClick={onTagDisableClick}
        />
      );
    }
    else {
      endisableable = (
        <Icon
          img="enable.svg"
          value={entity}
          title={_('Enable Tag')}
          onClick={onTagEnableClick}
        />
      );
    }
  }
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="gui_introduction"
          anchor="tags"
          title={_('Help: Tags')}
        />
        <ListIcon
          title={_('Tag List')}
          page="tags"
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          onClick={onTagCreateClick}
        />
        <CloneIcon
          entity={entity}
          onClick={onTagCloneClick}
        />
        <EditIcon
          entity={entity}
          onClick={onTagEditClick}
        />
        <TrashIcon
          entity={entity}
          onClick={onTagDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Tag as XML')}
          onClick={onTagDownloadClick}
        />
        {endisableable}
      </IconDivider>
    </Divider>
  );
});

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
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  return (
    <TagComponent
      onCloned={goto_details('tag', props)}
      onCloneError={onError}
      onCreated={goto_details('tag', props)}
      onDeleted={goto_list('tags', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onEnableError={onError}
      onEnabled={onChanged}
      onDisableError={onError}
      onDisabled={onChanged}
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
          detailsComponent={TagDetails}
          sectionIcon="tag.svg"
          toolBarIcons={ToolBarIcons}
          tagsComponent={false}
          title={_('Tag')}
          onTagCloneClick={clone}
          onTagCreateClick={create}
          onTagDeleteClick={delete_func}
          onTagDownloadClick={download}
          onTagEditClick={edit}
          onTagSaveClick={save}
          onTagEnableClick={enable}
          onTagDisableClick={disable}
          onTagRemoveClick={remove}
          onPermissionChanged={onChanged}
          onPermissionDownloaded={onDownloaded}
          onPermissionDownloadError={onError}
        >
          {({
            activeTab = 0,
            permissionsComponent,
            permissionsTitle,
            resourcesComponent,
            tagsTitle,
            onActivateTab,
            entity,
            ...other
          }) => {
            const {resourceCount} = entity;

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
                        title={_('Assigned Items')}
                        count={resourceCount}
                      />
                    </Tab>
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <TagDetails
                        entity={entity}
                      />
                    </TabPanel>
                    <TabPanel>
                      <ResourceList entity={entity}/>
                    </TabPanel>
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Layout>
            );
          }}
        </EntityPage>
      )}
    </TagComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const TagsPage = props => (
  <EntityContainer
    {...props}
    name="tag"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default TagsPage;

// vim: set ts=2 sw=2 tw=80:
