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

import _, {long_date} from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import DetailsBlock from '../../entity/block.js';
import EntityPage from '../../entity/page.js';
import EntityComponent from '../../entity/component.js';
import EntityContainer from '../../entity/container.js';
import {InfoLayout} from '../../entity/info.js';

import SeverityBar from '../../components/bar/severitybar.js';

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

import DetailsLink from '../../components/link/detailslink.js';

import Table from '../../components/table/stripedtable.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import CpeDetails from './details.js';

const ToolBarIcons = ({
  entity,
  onCpeDownloadClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="cpe"
        title={_('Help: CPEs')}
      />
      <ListIcon
        title={_('CPE List')}
        page="cpes"
      />
    </IconDivider>
    <ExportIcon
      value={entity}
      title={_('Export CPE')}
      onClick={onCpeDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCpeDownloadClick: PropTypes.func.isRequired,
};

const EntityInfo = ({
  entity,
}) => {
  const {id, modification_time, creation_time, update_time} = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Modified:')}</div>
      <div>{long_date(modification_time)}</div>
      <div>{_('Created:')}</div>
      <div>{long_date(creation_time)}</div>
      <div>{_('Last updated:')}</div>
      <div>{long_date(update_time)}</div>
    </InfoLayout>
  );
};

EntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Details = ({
  entity,
  links = true,
}) => {
  const {cves} = entity;
  return (
    <Layout flex="column">
      <CpeDetails
        entity={entity}
      />
      <DetailsBlock
        title={_('Reported Vulnerabilities')}
      >
        {cves.length > 0 ?
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
                  {_('Severity')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cves.map(cve => (
                <TableRow key={cve.id}>
                  <TableData>
                    <DetailsLink
                      id={cve.id}
                      type="cve"
                      textOnly={!links}
                    >
                      {cve.id}
                    </DetailsLink>
                  </TableData>
                  <TableData>
                    <SeverityBar
                      severity={cve.severity}
                    />
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table> :
          _('None')
        }
      </DetailsBlock>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const CpePage = props => (
  <EntityContainer
    {...props}
    name="cpe"
  >
    {({
      onChanged,
      onDownloaded,
      onError,
      ...cprops
    }) => (
      <EntityComponent
        name="cpe"
        onDownloaded={onDownloaded}
        onDownloadError={onError}
      >
        {({download}) => (
          <EntityPage
            {...props}
            {...cprops}
            sectionIcon="cpe.svg"
            title={_('CPE')}
            detailsComponent={Details}
            infoComponent={EntityInfo}
            permissionsComponent={false}
            toolBarIcons={ToolBarIcons}
            onCpeDownloadClick={download}
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
      </EntityComponent>
    )}
  </EntityContainer>
);

export default CpePage;

// vim: set ts=2 sw=2 tw=80:
