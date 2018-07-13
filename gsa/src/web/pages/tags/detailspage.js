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

import _ from 'gmp/locale.js';

import glamorous from 'glamorous';

import Filter from 'gmp/models/filter';

import {is_defined} from 'gmp/utils';

import {pluralizeType, normalizeType} from 'gmp/utils/entitytype';

import PropTypes from '../../utils/proptypes.js';
import withCapabilties from '../../utils/withCapabilities.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import TagComponent from './component.js';
import TagDetails from './details.js';

const MAX_RESOURCES = 40;

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

const Spacer = glamorous.div({
  height: '12px',
});

const Notification = ({id, resourceType}) => {
  const filter = Filter.fromString('tag_id=' + id);
  return (
    <Divider>
      {_('Listing only the first {{num}} items. ', {num: MAX_RESOURCES})}
      {_('To see all assigned resources click here:')}
      <ListIcon
        title={_('List Items')}
        filter={filter}
        page={pluralizeType(normalizeType(resourceType))}
      />
    </Divider>
  );
};

Notification.propTypes = {
  id: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
};

const ResourceList = (entity = {}) => {
  const {id, resources = [], resource_type} = entity.entity || {};
  const showNotification = resources.length > MAX_RESOURCES;
  const res = resources.slice(0, MAX_RESOURCES);
  return (
    <Layout flex="column">
      {showNotification &&
        <Notification
          id={id}
          resourceType={resource_type}
        />
      }
      <Spacer/>
      <ul>
        {res.map(resource =>
          (<li key={resource.id}>
            <DetailsLink
              id={resource.id}
              type={resource_type}
            >
              {resource.name}
            </DetailsLink>
          </li>)
        )}
      </ul>
    </Layout>
  );
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
            const {resource_count} = entity;

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
                        count={resource_count}
                      />
                    </Tab>
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
                      <TagDetails
                        entity={entity}
                      />
                    </TabPanel>
                    <TabPanel>
                      <ResourceList entity={entity}/>
                    </TabPanel>
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
