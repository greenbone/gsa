/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import DateTime from 'web/components/date/DateTime';
import ExportIcon from 'web/components/icon/ExportIcon';
import { CertBundAdvIcon } from 'web/components/icon/icons';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import ExternalLink from 'web/components/link/ExternalLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import DetailsBlock from 'web/entity/Block';
import EntityComponent from 'web/entity/EntityComponent';
import EntityPage from 'web/entity/EntityPage';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import CertBundAdvDetails from 'web/pages/certbund/Details';
import {selector, loadEntity} from 'web/store/entities/certbund';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({entity, onCertBundAdvDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        anchor="cert-bund-advisories"
        page="managing-secinfo"
        title={_('Help:  CERT-Bund Advisories')}
      />
      <ListIcon page="certbunds" title={_('CERT-Bund Advisories')} />
    </IconDivider>
    <ExportIcon
      title={_('Export CERT-Bund Advisory')}
      value={entity}
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

      {additionalInformation.length > 0 && (
        <DetailsBlock title={_('Other Links')}>
          <ul>
            {additionalInformation.map(info => (
              <li key={info.url + '-' + info.issuer}>
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
    onDownloadError={onError}
    onDownloaded={onDownloaded}
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
