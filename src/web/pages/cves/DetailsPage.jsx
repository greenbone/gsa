/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import {CveIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import CertLink from 'web/components/link/CertLink';
import DetailsLink from 'web/components/link/DetailsLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import DetailsBlock from 'web/entity/Block';
import EntityComponent from 'web/entity/EntityComponent';
import {InfoLayout} from 'web/entity/EntityInfo';
import EntityPage from 'web/entity/EntityPage';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import CveDetails from 'web/pages/cves/Details';
import {selector, loadEntity} from 'web/store/entities/cves';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = ({entity, onCveDownloadClick}) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="cve"
          page="managing-secinfo"
          title={_('Help: CVEs')}
        />
        <ListIcon page="cves" title={_('CVE List')} />
      </IconDivider>
      <ExportIcon
        title={_('Export CVE')}
        value={entity}
        onClick={onCveDownloadClick}
      />
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCveDownloadClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  const [_] = useTranslation();
  const {certs = [], nvts = []} = entity;
  let {products} = entity;
  products = products.toSorted();
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
              {certs.map(cert => {
                return (
                  <TableRow key={cert.name}>
                    <TableData>
                      <span>
                        <CertLink
                          id={cert.name}
                          textOnly={!links}
                          type={cert.cert_type}
                        />
                      </span>
                    </TableData>
                    <TableData>{cert.title}</TableData>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DetailsBlock>
      )}
      {products.length > 0 && (
        <DetailsBlock title={_('Vulnerable Products')}>
          <Layout flex="column">
            {products.map(product => {
              return (
                <span key={product}>
                  <DetailsLink id={product} type="cpe">
                    {product}
                  </DetailsLink>
                </span>
              );
            })}
          </Layout>
        </DetailsBlock>
      )}
      {nvts.length > 0 && (
        <DetailsBlock title={_('NVTs addressing this CVE')}>
          <Layout flex="column">
            {nvts.map(nvt => {
              return (
                <span key={nvt.id}>
                  <DetailsLink id={nvt.id} type="nvt">
                    {nvt.name}
                  </DetailsLink>
                </span>
              );
            })}
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
  const [_] = useTranslation();
  const {id, publishedTime, lastModifiedTime, updateTime} = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Published:')}</div>
      <div>
        {isDefined(publishedTime) ? (
          <DateTime date={publishedTime} />
        ) : (
          _('N/A')
        )}
      </div>
      <div>{_('Modified:')}</div>
      <div>
        {isDefined(updateTime) ? <DateTime date={updateTime} /> : _('N/A')}
      </div>
      <div>{_('Last updated:')}</div>
      <div>
        {isDefined(lastModifiedTime) ? (
          <DateTime date={lastModifiedTime} />
        ) : (
          _('N/A')
        )}
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
}) => {
  const [_] = useTranslation();

  return (
    <EntityComponent
      name="cve"
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
    >
      {({download}) => (
        <EntityPage
          {...props}
          entity={entity}
          infoComponent={EntityInfo}
          sectionIcon={<CveIcon size="large" />}
          title={_('CVE')}
          toolBarIcons={ToolBarIcons}
          onCveDownloadClick={download}
          onInteraction={onInteraction}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle title={_('CVE: {{name}}', {name: entity.name})} />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs>
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
                </TabsContainer>
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </EntityComponent>
  );
};

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
