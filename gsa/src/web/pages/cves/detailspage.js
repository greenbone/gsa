/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';
import DateTime from 'web/components/date/datetime';

import CveIcon from 'web/components/icon/cveicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import CertLink from 'web/components/link/certlink';
import DetailsLink from 'web/components/link/detailslink';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Table from 'web/components/table/stripedtable';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import EntityPage from 'web/entity/page';
import EntityComponent from 'web/entity/component';
import {InfoLayout} from 'web/entity/info';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import {selector, loadEntity} from 'web/store/entities/cves';

import PropTypes from 'web/utils/proptypes';

import CveDetails from './details';
import withEntityContainer from 'web/entity/withEntityContainer';

const ToolBarIcons = ({entity, onCveDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="managing-secinfo"
        anchor="cve"
        title={_('Help: CVEs')}
      />
      <ListIcon title={_('CVE List')} page="cves" />
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

const Details = ({entity, links = true}) => {
  const {certs = [], nvts = []} = entity;
  let {products} = entity;
  products = products.sort();
  return (
    <Layout flex="column">
      <CveDetails entity={entity} />

      {certs.length > 0 && (
        <DetailsBlock title={_('CERT Advisories referencing this CVE')}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Name')}</TableHead>
                <TableHead>{_('Title')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map(cert => (
                <TableRow key={cert.name}>
                  <TableData>
                    <span>
                      <CertLink
                        id={cert.name}
                        type={cert.cert_type}
                        textOnly={!links}
                      />
                    </span>
                  </TableData>
                  <TableData>{cert.title}</TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailsBlock>
      )}

      {products.length > 0 && (
        <DetailsBlock title={_('Vulnerable Products')}>
          <Layout flex="column">
            {products.map(product => (
              <span key={product}>
                <DetailsLink type="cpe" id={product}>
                  {product}
                </DetailsLink>
              </span>
            ))}
          </Layout>
        </DetailsBlock>
      )}

      {nvts.length > 0 && (
        <DetailsBlock title={_('NVTs addressing this CVE')}>
          <Layout flex="column">
            {nvts.map(nvt => (
              <span key={nvt.id}>
                <DetailsLink type="nvt" id={nvt.id}>
                  {nvt.name}
                </DetailsLink>
              </span>
            ))}
          </Layout>
        </DetailsBlock>
      )}
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const EntityInfo = ({entity}) => {
  const {id, publishedTime, lastModifiedTime, updateTime} = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Published:')}</div>
      <div>
        <DateTime date={publishedTime} />
      </div>
      <div>{_('Modified:')}</div>
      <div>
        <DateTime date={updateTime} />
      </div>
      <div>{_('Last updated:')}</div>
      <div>
        <DateTime date={lastModifiedTime} />
      </div>
    </InfoLayout>
  );
};

EntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const CvePage = ({
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <EntityComponent
    name="cve"
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
  >
    {({download}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<CveIcon size="large" />}
        title={_('CVE')}
        infoComponent={EntityInfo}
        toolBarIcons={ToolBarIcons}
        onCveDownloadClick={download}
        onInteraction={onInteraction}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle title={_('CVE: {{name}}', {name: entity.name})} />
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
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <Details entity={entity} />
                    </TabPanel>
                    <TabPanel>
                      <EntityTags
                        entity={entity}
                        onChanged={onChanged}
                        onError={onError}
                        onInteraction={onInteraction}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Layout>
            </React.Fragment>
          );
        }}
      </EntityPage>
    )}
  </EntityComponent>
);

CvePage.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('cve', {
  load: loadEntity,
  entitySelector: selector,
})(CvePage);

// vim: set ts=2 sw=2 tw=80:
