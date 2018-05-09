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

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import CertLink from '../../components/link/certlink.js';
import DetailsLink from '../../components/link/detailslink.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import Table from '../../components/table/stripedtable.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import CveDetails from './details.js';

const ToolBarIcons = ({
  entity,
  onCveDownloadClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="cve"
        title={_('Help: CVEs')}
      />
      <ListIcon
        title={_('CVE List')}
        page="cves"
      />
    </IconDivider>
    <ExportIcon
      value={entity}
      title={_('Export CVE')}
      onClick={onCveDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCveDownloadClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  links = true,
}) => {
  const {certs, nvts} = entity;
  let {products} = entity;
  products = products.sort();
  return (
    <Layout flex="column">

      <CveDetails
        entity={entity}
      />

      {certs.length > 0 &&
        <DetailsBlock
          title={_('CERT Advisories referencing this CVE')}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
                  {_('Title')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map(cert => (
                <TableRow key={cert.name}>
                  <TableData>
                    <CertLink
                      id={cert.name}
                      type={cert.cert_type}
                      textOnly={!links}
                    />
                  </TableData>
                  <TableData>
                    {cert.title}
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailsBlock>
      }

      {products.length > 0 &&
        <DetailsBlock
          title={_('Vulnerable Products')}>
          <Layout flex="column">
            {products.map(product => (
              <DetailsLink
                key={product}
                type="cpe"
                id={product}
              >
                {product}
              </DetailsLink>
            ))}
          </Layout>
        </DetailsBlock>
      }

      {nvts.length > 0 &&
        <DetailsBlock
          title={_('NVTs addressing this CVE')}>
          <Layout flex="column">
            {nvts.map(nvt => (
              <DetailsLink
                key={nvt.id}
                type="info"
                page="nvt"
                id={nvt.id}
              >
                {nvt.name}
              </DetailsLink>
            ))}
          </Layout>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const EntityInfo = ({
  entity,
}) => {
  const {id, published_time, last_modified_time, update_time} = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Published:')}</div>
      <div>{long_date(published_time)}</div>
      <div>{_('Modified:')}</div>
      <div>{long_date(update_time)}</div>
      <div>{_('Last updated:')}</div>
      <div>{long_date(last_modified_time)}</div>
    </InfoLayout>
  );
};

EntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const CvePage = props => (
  <EntityContainer
    {...props}
    name="cve"
  >
    {({
      onChanged,
      onDownloaded,
      onError,
      ...cprops
    }) => (
      <EntityComponent
        name="cve"
        onDownloaded={onDownloaded}
        onDownloadError={onError}
      >
        {({download}) => (
          <EntityPage
            {...props}
            {...cprops}
            sectionIcon="cve.svg"
            title={_('CVE')}
            detailsComponent={Details}
            infoComponent={EntityInfo}
            permissionsComponent={false}
            toolBarIcons={ToolBarIcons}
            onCveDownloadClick={download}
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
      </EntityComponent>
    )}
  </EntityContainer>
);

export default CvePage;

// vim: set ts=2 sw=2 tw=80:
