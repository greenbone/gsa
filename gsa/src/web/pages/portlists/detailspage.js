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

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';
import PortListIcon from 'web/components/icon/portlisticon';

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
import {goto_details, goto_list} from 'web/entity/component';
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

import {selector, loadEntity} from 'web/store/entities/portlists';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';

import PortListComponent from './component';
import PortListDetails from './details';
import PortRangesTable from './portrangestable';

const ToolBarIcons = ({
  entity,
  onPortListCloneClick,
  onPortListCreateClick,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="search"
        searchTerm="port list"
        title={_('Help: PortList Details')}
      />
      <ListIcon title={_('PortList List')} page="portlists" />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onPortListCreateClick} />
      <CloneIcon entity={entity} onClick={onPortListCloneClick} />
      <EditIcon entity={entity} onClick={onPortListEditClick} />
      <TrashIcon entity={entity} onClick={onPortListDeleteClick} />
      <ExportIcon
        value={entity}
        title={_('Export PortList as XML')}
        onClick={onPortListDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onPortListCloneClick: PropTypes.func.isRequired,
  onPortListCreateClick: PropTypes.func.isRequired,
  onPortListDeleteClick: PropTypes.func.isRequired,
  onPortListDownloadClick: PropTypes.func.isRequired,
  onPortListEditClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  return (
    <Layout flex="column">
      <PortListDetails entity={entity} links={links} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const PortRanges = ({entity}) => {
  const {port_ranges = []} = entity;

  return (
    <Layout title={_('Port Ranges ({{count}})', {count: port_ranges.length})}>
      {port_ranges.length === 0 && _('No port ranges available')}
      {port_ranges.length > 0 && (
        <PortRangesTable actions={false} portRanges={port_ranges} />
      )}
    </Layout>
  );
};

PortRanges.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  links = true,
  permissions = [],
  onError,
  onChanged,
  onDownloaded,
  onInteraction,
  ...props
}) => (
  <PortListComponent
    onCloned={goto_details('portlist', props)}
    onCloneError={onError}
    onCreated={goto_details('portlist', props)}
    onDeleted={goto_list('portlists', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, create, delete: delete_func, download, edit, save}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<PortListIcon size="large" />}
        title={_('Port List')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onInteraction={onInteraction}
        onPortListCloneClick={clone}
        onPortListCreateClick={create}
        onPortListDeleteClick={delete_func}
        onPortListDownloadClick={download}
        onPortListEditClick={edit}
        onPortListSaveClick={save}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <Layout grow="1" flex="column">
              <TabLayout grow="1" align={['start', 'end']}>
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={onActivateTab}
                >
                  <Tab>{_('Information')}</Tab>
                  <EntitiesTab entities={entity.port_ranges}>
                    {_('Port Ranges')}
                  </EntitiesTab>
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
                    <PortListDetails entity={entity} links={links} />
                  </TabPanel>
                  <TabPanel>
                    <PortRanges entity={entity} />
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
          );
        }}
      </EntityPage>
    )}
  </PortListComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  links: PropTypes.bool,
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

export default withEntityContainer('portlist', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
