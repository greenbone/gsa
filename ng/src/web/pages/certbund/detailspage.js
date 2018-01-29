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

import _, {datetime} from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import DetailsBlock from '../../entity/block.js';
import EntityPage from '../../entity/page.js';
import EntityComponent from '../../entity/component.js';
import EntityContainer from '../../entity/container.js';

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
import ExternalLink from '../../components/link/externallink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import CertBundAdvDetails from './details.js';

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
        page="certbundadvs"
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
                    {datetime(rev.date)}
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

const CertBundAdvPage = props => (
  <EntityContainer
    {...props}
    name="certbundadv"
    resourceType="cert_bund_adv"
  >
    {({
      onChanged,
      onDownloaded,
      onError,
      ...cprops
    }) => (
      <EntityComponent
        name="certbundadv"
        onDownloaded={onDownloaded}
        onDownloadError={onError}
      >
        {({download}) => (
          <EntityPage
            {...props}
            {...cprops}
            sectionIcon="cert_bund_adv.svg"
            title={_('CERT-Bund Advisory')}
            detailsComponent={Details}
            permissionsComponent={false}
            toolBarIcons={ToolBarIcons}
            onCertBundAdvDownloadClick={download}
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

export default CertBundAdvPage;

// vim: set ts=2 sw=2 tw=80:
