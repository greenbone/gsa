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

import {isDefined} from 'gmp/utils/identity';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

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

import DetailsBlock from 'web/entity/block';
import EntityPage from 'web/entity/page';
import EntityComponent from 'web/entity/component';
import EntityContainer from 'web/entity/container';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import PropTypes from 'web/utils/proptypes';

import DfnCertAdvDetails from './details';

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
        page="dfncerts"
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
        {isDefined(summary) ?
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
    name="dfncert"
    resourceType="dfn_cert_adv"
  >
    {({
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
      ...cprops
    }) => (
      <EntityComponent
        name="dfncert"
        onDownloaded={onDownloaded}
        onDownloadError={onError}
      >
        {({download}) => (
          <EntityPage
            {...props}
            {...cprops}
            sectionIcon="dfn_cert_adv.svg"
            title={_('DFN-CERT Advisory')}
            toolBarIcons={ToolBarIcons}
            onDfnCertAdvDownloadClick={download}
          >
            {({
              activeTab = 0,
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
    )}
  </EntityContainer>
);

export default DfnCertAdvPage;

// vim: set ts=2 sw=2 tw=80:
