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
import {longDate} from 'gmp/locale/date';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import DetailsLink from 'web/components/link/detailslink';
import ExternalLink from 'web/components/link/externallink';

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

import {
  selector,
  loadEntity,
} from 'web/store/entities/certbund';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import PropTypes from 'web/utils/proptypes';

import CertBundAdvDetails from './details';

const ToolBarIcons = ({
  entity,
  onCertBundAdvDownloadClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="cert-bund"
        title={_('Help:  CERT-Bund Advisories')}
      />
      <ListIcon
        title={_('CERT-Bund Advisories')}
        page="certbunds"
      />
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

const Details = ({
  entity,
}) => {
  const {
    additional_information,
    categories,
    description,
    cves,
    revision_history = [],
  } = entity;
  return (
    <Layout flex="column">
      <CertBundAdvDetails
        entity={entity}
      />

      <DetailsBlock
        title={_('Revision History')}
      >
        {revision_history.length > 0 &&
          <InfoTable>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Revision')}
                </TableHead>
                <TableHead>
                  {_('Date')}
                </TableHead>
                <TableHead>
                  {_('Description')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revision_history.map(rev => (
                <TableRow
                  key={rev.revision}
                >
                  <TableData>
                    {rev.revision}
                  </TableData>
                  <TableData>
                    {longDate(rev.date)}
                  </TableData>
                  <TableData>
                    {rev.description}
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </InfoTable>
        }
      </DetailsBlock>

      <DetailsBlock
        title={_('Categories')}
      >
        {categories.length > 0 ?
          <ul>
            {categories.map(category => (
              <li key={category}>{category}</li>
            ))}
          </ul> :
          _('None')
        }
      </DetailsBlock>

      <DetailsBlock
        title={_('Description')}
      >
        {description.length > 0 ?
          description.map(text => (
            <p key={text}>{text}</p>
          )) :
          _('None')
        }
      </DetailsBlock>

      <DetailsBlock
        title={_('References CVEs')}
      >
        {cves.length > 0 ?
          <ul>
            {cves.map(cve => (
              <li key={cve}>
                <DetailsLink
                  type="cve"
                  id={cve}
                >
                  {cve}
                </DetailsLink>
              </li>
            ))}
          </ul> :
          _('None')
        }
      </DetailsBlock>

      {additional_information.length > 0 &&
        <DetailsBlock
          title={_('Other Links')}
        >
          <ul>
            {additional_information.map(info => (
              <li key={info.url}>
                <Layout flex="column">
                  <b>{info.issuer}</b>
                  <ExternalLink
                    to={info.url}
                  >
                    {info.url}
                  </ExternalLink>
                </Layout>
              </li>
            ))}
          </ul>
        </DetailsBlock>
      }
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
  onTagAddClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagEditClick,
  onTagEnableClick,
  onTagRemoveClick,
  ...props
}) => (
  <EntityComponent
    name="certbund"
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >
    {({download}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon="cert_bund_adv.svg"
        title={_('CERT-Bund Advisory')}
        toolBarIcons={ToolBarIcons}
        onCertBundAdvDownloadClick={download}
      >
        {({
          activeTab = 0,
          onActivateTab,
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
                    <EntityTags
                      entity={entity}
                      onTagAddClick={onTagAddClick}
                      onTagDeleteClick={onTagDeleteClick}
                      onTagDisableClick={onTagDisableClick}
                      onTagEditClick={onTagEditClick}
                      onTagEnableClick={onTagEnableClick}
                      onTagCreateClick={onTagCreateClick}
                      onTagRemoveClick={onTagRemoveClick}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Layout>
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
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

export default withEntityContainer('certbund', {
  load: loadEntity,
  entitySelector: selector,
})(CertBundAdvPage);

// vim: set ts=2 sw=2 tw=80:
