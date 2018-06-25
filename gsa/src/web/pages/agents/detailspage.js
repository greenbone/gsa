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

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';
import EntityPage from '../../entity/page.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Icon from '../../components/icon/icon.js';
import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import AgentComponent from './component.js';
import AgentDetails from './details.js';

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
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
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
                  {is_defined(tagsComponent) &&
                    <Tab>
                      {tagsTitle}
                    </Tab>
                  }
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
                    <AgentDetails
                      entity={entity}
                    />
                  </TabPanel>
                  {is_defined(tagsComponent) &&
                    <TabPanel>
                      {tagsComponent}
                    </TabPanel>
                  }
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
  </AgentComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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
