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

import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import EntityPage from 'web/entity/page';
import EntityContainer, {
  permissions_subject_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import ExportIcon from 'web/components/icon/exporticon';
import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';

import GroupComponent from './component';
import GroupDetails from './details';

const ToolBarIcons = ({
  entity,
  onGroupCloneClick,
  onGroupCreateClick,
  onGroupDeleteClick,
  onGroupDownloadClick,
  onGroupEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="gui_administration"
        anchor="groups"
        title={_('Help: Group Details')}
      />
      <ListIcon
        title={_('Groups List')}
        page="groups"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onGroupCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onGroupCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onGroupEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onGroupDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Group as XML')}
        onClick={onGroupDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onGroupCloneClick: PropTypes.func.isRequired,
  onGroupCreateClick: PropTypes.func.isRequired,
  onGroupDeleteClick: PropTypes.func.isRequired,
  onGroupDownloadClick: PropTypes.func.isRequired,
  onGroupEditClick: PropTypes.func.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onTagAddClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagEditClick,
  onTagEnableClick,
  onTagRemoveClick,
  ...props
}) => (
  <GroupComponent
    onCloned={goto_details('group', props)}
    onCloneError={onError}
    onCreated={goto_details('group', props)}
    onDeleted={goto_list('groups', props)}
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
        entity={entity}
        sectionIcon="group.svg"
        title={_('Group')}
        toolBarIcons={ToolBarIcons}
        onGroupCloneClick={clone}
        onGroupCreateClick={create}
        onGroupDeleteClick={delete_func}
        onGroupDownloadClick={download}
        onGroupEditClick={edit}
        onGroupSaveClick={save}
      >
        {({
          activeTab = 0,
          onActivateTab,
        }) => {
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
                    <GroupDetails
                      entity={entity}
                    />
                  </TabPanel>
                  <TabPanel>
                    <EntityTags
                      entity={entity}
                      onTagAddClick={onTagAddClick}
                      onTagDeleteClick={onTagDeleteClick}
                      onTagDisableClick={onTagDisableClick}
                      onTagEditClick={onTagEditClick}
                      onTagEnableClick={onTagEnableClick}
                      onTagCreateClick={onTagCreateClick}
                      onTagRemoveClick={onTagRemoveClick}
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
            </Layout>
          );
        }}
      </EntityPage>
    )}
  </GroupComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

const GroupPage = props => (
  <EntityContainer
    {...props}
    name="group"
    loaders={[
      permissions_subject_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default GroupPage;

// vim: set ts=2 sw=2 tw=80:
