/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DfnCertAdvIcon from 'web/components/icon/dfncertadvicon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
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
import DetailsBlock from 'web/entity/block';
import EntityComponent from 'web/entity/component';
import EntityPage from 'web/entity/page';
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
        anchor="dfn-cert-advisories"
        page="managing-secinfo"
        title={_('Help: DFN-CERT Advisories')}
      />
      <ListIcon page="dfncerts" title={_('DFN-CERT Advisories')} />
    </IconDivider>
    <ExportIcon
      title={_('Export DFN-CERT Advisory')}
      value={entity}
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
                <DetailsLink id={cve} type="cve">
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
    onDownloadError={onError}
    onDownloaded={onDownloaded}
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
              <Layout flex="column" grow="1">
                <TabLayout align={['start', 'end']} grow="1">
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
