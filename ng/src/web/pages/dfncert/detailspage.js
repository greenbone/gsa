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

import DfnCertAdvDetails from './details.js';

const ToolBarIcons = ({
  entity,
  onDfnCertAdvDownloadClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="id15"
        title={_('Help: DFN-CERT Advisories')}
      />
      <ListIcon
        title={_('DFN-CERT Advisories')}
        page="dfncertadvs"
      />
    </IconDivider>
    <ExportIcon
      value={entity}
      title={_('Export DFN-CERT Advisory')}
      onClick={onDfnCertAdvDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onDfnCertAdvDownloadClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  links = true,
}) => {
  const {
    cves,
    summary,
    additional_links,
  } = entity;
  return (
    <Layout flex="column">
      <DfnCertAdvDetails
        entity={entity}
      />

      <DetailsBlock
        title={_('Summary')}
      >
        {is_defined(summary) ?
          <p>{summary}</p> :
          _('None')
        }
      </DetailsBlock>

      {additional_links.length > 0 &&
        <DetailsBlock
          title={_('Other Links')}
        >
          <ul>
            {additional_links.map(link => (
              <li key={link}>
                <ExternalLink
                  to={link}
                >
                  {link}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </DetailsBlock>
      }

      <DetailsBlock
        title={_('Referenced CVEs')}
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
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const DfnCertAdvPage = props => (
  <EntityContainer
    {...props}
    name="dfncertadv"
    resourceType="dfn_cert_adv"
  >
    {({
      onChanged,
      onDownloaded,
      onError,
      ...cprops
    }) => (
      <EntityComponent
        name="dfncertadv"
        onDownloaded={onDownloaded}
        onDownloadError={onError}
      >
        {({download}) => (
          <EntityPage
            {...props}
            {...cprops}
            sectionIcon="dfn_cert_adv.svg"
            title={_('DFN-CERT Advisory')}
            detailsComponent={Details}
            permissionsComponent={false}
            toolBarIcons={ToolBarIcons}
            onDfnCertAdvDownloadClick={download}
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

export default DfnCertAdvPage;

// vim: set ts=2 sw=2 tw=80:
