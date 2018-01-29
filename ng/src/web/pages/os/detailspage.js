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

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_list} from '../../entity/component.js';

import Badge from '../../components/badge/badge.js';

import SeverityBar from '../../components/bar/severitybar.js';

import CpeIcon from '../../components/icon/cpeicon.js';
import DeleteIcon from '../../components/icon/deleteicon.js';
import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Link from '../../components/link/link.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import OsComponent from './component.js';

const ToolBarIcons = ({
  entity,
  links = true,
  onOperatingSystemDeleteClick,
  onOperatingSystemDownloadClick,
}, {capabilities}) => {
  const {hosts} = entity;
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="operating-systems-view"
          title={_('Help: Operating Systems')}
        />
        <ListIcon
          title={_('Operating System List')}
          page="operatingsystems"
        />
      </IconDivider>
      <IconDivider>
        {capabilities.mayDelete('os') && (
          entity.isInUse() ?
            <DeleteIcon
              active={false}
              title={_('Operating System is in use')}/> :
            <DeleteIcon
              value={entity}
              title={_('Delete')}
              onClick={onOperatingSystemDeleteClick}/>
        )}
        <ExportIcon
          value={entity}
          onClick={onOperatingSystemDownloadClick}
          title={_('Export Operating System')}/>
      </IconDivider>
      <IconDivider>
        <Badge
          content={hosts.length}>
          <Link
            to="hosts"
            filter={'os~"' + entity.name + '"'}
            textOnly={!links}
            title={_('Hosts with Operating System {{- name}}', entity)}
          >
            <Icon
              img="host.svg"
            />
          </Link>
        </Badge>
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onOperatingSystemDeleteClick: PropTypes.func.isRequired,
  onOperatingSystemDownloadClick: PropTypes.func.isRequired,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

const Details = ({entity}) => {
  const {
    average_severity,
    highest_severity,
    latest_severity,
    name,
  } = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Name')}
            </TableData>
            <TableData>
              <IconDivider flex align={['start', 'center']}>
                <CpeIcon name={name}/>
                <span>{name}</span>
              </IconDivider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Latest Severity')}
            </TableData>
            <TableData>
              <SeverityBar severity={latest_severity}/>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Highest Severity')}
            </TableData>
            <TableData>
              <SeverityBar severity={highest_severity}/>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Average Severity')}
            </TableData>
            <TableData>
              <SeverityBar severity={average_severity}/>
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onDownloaded,
  onChanged,
  onError,
  ...props
}) => (
  <OsComponent
    onDeleted={goto_list('operatingsystems', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >
    {({
      delete: delete_func,
      download,
    }) => (
      <EntityPage
        {...props}
        detailsComponent={Details}
        sectionIcon="os.svg"
        title={_('Operating System')}
        toolBarIcons={ToolBarIcons}
        onOperatingSystemDeleteClick={delete_func}
        onOperatingSystemDownloadClick={download}
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
                    <Details
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
  </OsComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const HostPage = props => (
  <EntityContainer
    {...props}
    name="operatingsystem"
    resourceType="os"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => (
      <Page {...props} {...cprops} />
    )}
  </EntityContainer>
);

export default HostPage;

// vim: set ts=2 sw=2 tw=80:
