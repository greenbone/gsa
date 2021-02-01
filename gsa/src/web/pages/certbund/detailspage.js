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

import CertBundAdvIcon from 'web/components/icon/certbundadvicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DetailsLink from 'web/components/link/detailslink';
import ExternalLink from 'web/components/link/externallink';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import EntityPage from 'web/entity/page';
import EntityComponent from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer from 'web/entity/withEntityContainer';

import {selector, loadEntity} from 'web/store/entities/certbund';

import PropTypes from 'web/utils/proptypes';

import CertBundAdvDetails from './details';

const ToolBarIcons = ({entity, onCertBundAdvDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="managing-secinfo"
        anchor="cert-bund-advisories"
        title={_('Help:  CERT-Bund Advisories')}
      />
      <ListIcon title={_('CERT-Bund Advisories')} page="certbunds" />
    </IconDivider>
    <ExportIcon
      value={entity}
      title={_('Export CERT-Bund Advisory')}
      onClick={onCertBundAdvDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCertBundAdvDownloadClick: PropTypes.func.isRequired,
};

const Details = ({entity}) => {
  const {
    additionalInformation,
    categories,
    description,
    cves,
    revisionHistory = [],
  } = entity;
  return (
    <Layout flex="column">
      <CertBundAdvDetails entity={entity} />

      <DetailsBlock title={_('Revision History')}>
        {revisionHistory.length > 0 && (
          <InfoTable>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Revision')}</TableHead>
                <TableHead>{_('Date')}</TableHead>
                <TableHead>{_('Description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisionHistory.map(rev => (
                <TableRow key={rev.revision}>
                  <TableData>{rev.revision}</TableData>
                  <TableData>
                    <DateTime date={rev.date} />
                  </TableData>
                  <TableData>{rev.description}</TableData>
                </TableRow>
              ))}
            </TableBody>
          </InfoTable>
        )}
      </DetailsBlock>

      <DetailsBlock title={_('Categories')}>
        {categories.length > 0 ? (
          <ul>
            {categories.map(category => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        ) : (
          _('None')
        )}
      </DetailsBlock>

      <DetailsBlock title={_('Description')}>
        {description.length > 0
          ? description.map(text => <p key={text}>{text}</p>)
          : _('None')}
      </DetailsBlock>

      <DetailsBlock title={_('References CVEs')}>
        {cves.length > 0 ? (
          <ul>
            {cves.map(cve => (
              <li key={cve}>
                <DetailsLink type="cve" id={cve}>
                  {cve}
                </DetailsLink>
              </li>
            ))}
          </ul>
        ) : (
          _('None')
        )}
      </DetailsBlock>

      {additionalInformation.length > 0 && (
        <DetailsBlock title={_('Other Links')}>
          <ul>
            {additionalInformation.map(info => (
              <li key={info.url}>
                <Layout flex="column">
                  <b>{info.issuer}</b>
                  <span>
                    <ExternalLink to={info.url}>{info.url}</ExternalLink>
                  </span>
                </Layout>
              </li>
            ))}
          </ul>
        </DetailsBlock>
      )}
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const CertBundAdvPage = ({
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <EntityComponent
    name="certbund"
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
  >
    {({download}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<CertBundAdvIcon size="large" />}
        title={_('CERT-Bund Advisory')}
        toolBarIcons={ToolBarIcons}
        onCertBundAdvDownloadClick={download}
        onInteraction={onInteraction}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle
                title={_('CERT-Bund Advisory: {{title}}', {
                  title: entity.title,
                })}
              />
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

CertBundAdvPage.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('certbund', {
  load: loadEntity,
  entitySelector: selector,
})(CertBundAdvPage);

// vim: set ts=2 sw=2 tw=80:
