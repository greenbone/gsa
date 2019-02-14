/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import AgentIcon from 'web/components/icon/agenticon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import VerifyIcon from 'web/components/icon/verifyicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import {goto_details, goto_list} from 'web/entity/component';
import EntityPage from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {selector, loadEntity} from 'web/store/entities/agents';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import AgentComponent from './component';
import AgentDetails from './details';

const ToolBarIcons = withCapabilities(
  ({
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
        <ListIcon title={_('Agent List')} page="agents" />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onAgentCreateClick} />
        <CloneIcon entity={entity} onClick={onAgentCloneClick} />
        <EditIcon entity={entity} onClick={onAgentEditClick} />
        <TrashIcon entity={entity} onClick={onAgentDeleteClick} />
        <ExportIcon
          value={entity}
          title={_('Export Agent as XML')}
          onClick={onAgentDownloadClick}
        />
        {capabilities.mayOp('verify_report_format') && (
          <VerifyIcon
            value={entity}
            title={_('Verify Agent')}
            onClick={onAgentVerifyClick}
          />
        )}
        <AgentIcon
          value={entity}
          title={_('Download Agent Installer Package')}
          onClick={onAgentInstallerDownloadClick}
        />
      </IconDivider>
    </Divider>
  ),
);

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
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
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
    onInteraction={onInteraction}
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
        entity={entity}
        sectionIcon={<AgentIcon size="large" />}
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
        onInteraction={onInteraction}
      >
        {({activeTab = 0, onActivateTab}) => (
          <Layout grow="1" flex="column">
            <TabLayout grow="1" align={['start', 'end']}>
              <TabList
                active={activeTab}
                align={['start', 'stretch']}
                onActivateTab={onActivateTab}
              >
                <Tab>{_('Information')}</Tab>
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
                  <AgentDetails entity={entity} />
                </TabPanel>
                <TabPanel>
                  <EntityTags
                    entity={entity}
                    onChanged={onChanged}
                    onError={onError}
                    onInteraction={onInteraction}
                  />
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
        )}
      </EntityPage>
    )}
  </AgentComponent>
);

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

export default withEntityContainer('agent', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
