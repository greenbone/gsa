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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

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

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import PortListComponent from './component.js';
import PortListDetails from './details.js';
import PortRangesTable from './portrangestable.js';

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
      <ListIcon
        title={_('PortList List')}
        page="portlists"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onPortListCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onPortListCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onPortListEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onPortListDeleteClick}
      />
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

const Details = ({
  entity,
  links = true,
}) => {
  return (
    <Layout flex="column">
      <PortListDetails
        entity={entity}
        links={links}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const PortRanges = ({entity}) => {
  const {
    port_ranges = [],
  } = entity;

  return (
    <Layout
      title={_('Port Ranges ({{count}})', {count: port_ranges.length})}
    >
      {port_ranges.length === 0 &&
        _('No port ranges available')
      }
      {port_ranges.length > 0 &&
        <PortRangesTable
          actions={false}
          portRanges={port_ranges}
        />
      }
    </Layout>
  );
};

PortRanges.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onError,
  onChanged,
  onDownloaded,
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
        sectionIcon="port_list.svg"
        title={_('Port List')}
        detailsComponent={Details}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onPortListCloneClick={clone}
        onPortListCreateClick={create}
        onPortListDeleteClick={delete_func}
        onPortListDownloadClick={download}
        onPortListEditClick={edit}
        onPortListSaveClick={save}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      >
        {({
          activeTab = 0,
          links = true,
          permissionsComponent,
          permissionsTitle,
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
        }) => {
          const {
            port_ranges = [],
          } = entity;
          const portRangesCount = port_ranges.length;

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
                      title={_('Port Ranges')}
                      count={portRangesCount}
                    />
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
                    <PortListDetails
                      entity={entity}
                      links={links}
                    />
                  </TabPanel>
                  <TabPanel>
                    <PortRanges entity={entity}/>
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
  </PortListComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const PortListPage = props => (
  <EntityContainer
    {...props}
    name="portlist"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default PortListPage;
