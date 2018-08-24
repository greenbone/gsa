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

import Badge from 'web/components/badge/badge';

import SeverityBar from 'web/components/bar/severitybar';

import CpeIcon from 'web/components/icon/cpeicon';
import DeleteIcon from 'web/components/icon/deleteicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Link from 'web/components/link/link';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityPage, {Col} from 'web/entity/page';
import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import OsComponent from './component';

let ToolBarIcons = ({
  capabilities,
  entity,
  links = true,
  onOperatingSystemDeleteClick,
  onOperatingSystemDownloadClick,
}) => {
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
              title={_('Operating System is in use')}
            /> :
            <DeleteIcon
              value={entity}
              title={_('Delete')}
              onClick={onOperatingSystemDeleteClick}
            />
        )}
        <ExportIcon
          value={entity}
          onClick={onOperatingSystemDownloadClick}
          title={_('Export Operating System')}
        />
      </IconDivider>
      <IconDivider>
        <Badge
          content={hosts.length}
        >
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
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onOperatingSystemDeleteClick: PropTypes.func.isRequired,
  onOperatingSystemDownloadClick: PropTypes.func.isRequired,
};

ToolBarIcons = withCapabilities(ToolBarIcons);

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
        <colgroup>
          <Col width="10%"/>
          <Col width="90%"/>
        </colgroup>
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
                    <Details
                      entity={entity}
                    />
                  </TabPanel>
                  <TabPanel>
                    {tagsComponent}
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
