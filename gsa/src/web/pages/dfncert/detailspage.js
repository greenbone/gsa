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

import {isDefined} from 'gmp/utils/identity';

import DfnCertAdvIcon from 'web/components/icon/dfncertadvicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

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
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer from 'web/entity/withEntityContainer';

import {selector, loadEntity} from 'web/store/entities/dfncerts';

import PropTypes from 'web/utils/proptypes';

import DfnCertAdvDetails from './details';

const ToolBarIcons = ({entity, onDfnCertAdvDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="managing-secinfo"
        anchor="dfn-cert-advisories"
        title={_('Help: DFN-CERT Advisories')}
      />
      <ListIcon title={_('DFN-CERT Advisories')} page="dfncerts" />
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

const Details = ({entity, links = true}) => {
  const {cves, summary, additionalLinks} = entity;
  return (
    <Layout flex="column">
      <DfnCertAdvDetails entity={entity} />

      <DetailsBlock title={_('Summary')}>
        {isDefined(summary) ? <p>{summary}</p> : _('None')}
      </DetailsBlock>

      {additionalLinks.length > 0 && (
        <DetailsBlock title={_('Other Links')}>
          <ul>
            {additionalLinks.map(link => (
              <li key={link}>
                <ExternalLink to={link}>{link}</ExternalLink>
              </li>
            ))}
          </ul>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('Referenced CVEs')}>
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
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const DfnCertAdvPage = ({
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <EntityComponent
    name="dfncert"
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
  >
    {({download}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<DfnCertAdvIcon size="large" />}
        title={_('DFN-CERT Advisory')}
        toolBarIcons={ToolBarIcons}
        onDfnCertAdvDownloadClick={download}
        onInteraction={onInteraction}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle
                title={_('DFN-CERT Advisory: {{title}}', {title: entity.title})}
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

DfnCertAdvPage.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('dfncert', {
  load: loadEntity,
  entitySelector: selector,
})(DfnCertAdvPage);

// vim: set ts=2 sw=2 tw=80:
