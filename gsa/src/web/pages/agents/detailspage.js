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

import Icon from 'web/components/icon/icon';
import ExportIcon from 'web/components/icon/exporticon';
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

import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPage from 'web/entity/page';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import AgentComponent from './component';
import AgentDetails from './details';

const ToolBarIcons = withCapabilities(({
  capabilities,
  entity,
  onAgentCloneClick,
  onAgentCreateClick,
  onAgentDeleteClick,
  onAgentDownloadClick,
  onAgentEditClick,
  onAgentInstallerDownloadClick,
  onAgentVerifyClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="search"
        searchTerm="agent"
        title={_('Help: Agents')}
      />
      <ListIcon
        title={_('Agent List')}
        page="agents"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onAgentCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onAgentCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onAgentEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onAgentDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Agent as XML')}
        onClick={onAgentDownloadClick}
      />
      {capabilities.mayOp('verify_report_format') &&
        <Icon
          img="verify.svg"
          value={entity}
          title={_('Verify Agent')}
          onClick={onAgentVerifyClick}
        />
      }
      <Icon
        img="agent.svg"
        value={entity}
        title={_('Download Agent Installer Package')}
        onClick={onAgentInstallerDownloadClick}
      />
    </IconDivider>
  </Divider>
));

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onAgentCloneClick: PropTypes.func.isRequired,
  onAgentCreateClick: PropTypes.func.isRequired,
  onAgentDeleteClick: PropTypes.func.isRequired,
  onAgentDownloadClick: PropTypes.func.isRequired,
  onAgentEditClick: PropTypes.func.isRequired,
  onAgentInstallerDownloadClick: PropTypes.func.isRequired,
};

const Page = ({
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
  <AgentComponent
    onCloned={goto_details('agent', props)}
    onCloneError={onError}
    onCreated={goto_details('agent', props)}
    onDeleted={goto_list('agents', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInstallerDownloaded={onDownloaded}
    onInstallerDownloadError={onError}
    onSaved={onChanged}
    onVerified={onChanged}
    onVerifyError={onError}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      downloadinstaller,
      edit,
      save,
      verify,
    }) => (
      <EntityPage
        {...props}
        detailsComponent={AgentDetails}
        sectionIcon="agent.svg"
        toolBarIcons={ToolBarIcons}
        title={_('Agent')}
        onAgentCloneClick={clone}
        onAgentCreateClick={create}
        onAgentDeleteClick={delete_func}
        onAgentDownloadClick={download}
        onAgentEditClick={edit}
        onAgentInstallerDownloadClick={downloadinstaller}
        onAgentSaveClick={save}
        onAgentVerifyClick={verify}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      >
        {({
          activeTab = 0,
          permissionsComponent,
          permissionsTitle,
          onActivateTab,
          entity,
          ...other
        }) => (
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
                <Tab>
                  {permissionsTitle}
                </Tab>
              </TabList>
            </TabLayout>

            <Tabs active={activeTab}>
              <TabPanels>
                <TabPanel>
                  <AgentDetails
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
                  {permissionsComponent}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Layout>
        )}
      </EntityPage>
    )}
  </AgentComponent>
);

Page.propTypes = {
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

const AgentPage = props => (
  <EntityContainer
    {...props}
    name="agent"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default AgentPage;

// vim: set ts=2 sw=2 tw=80:
