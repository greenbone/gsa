/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import DateTime from 'web/components/date/datetime';
import CpeLogoIcon from 'web/components/icon/cpelogoicon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';
import DetailsLink from 'web/components/link/detailslink';
import Loading from 'web/components/loading/loading';
import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/stripedtable';
import DetailsBlock from 'web/entity/block';
import EntityComponent from 'web/entity/component';
import {InfoLayout} from 'web/entity/info';
import EntityPage from 'web/entity/page';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import {selector, loadEntity} from 'web/store/entities/cpes';
import PropTypes from 'web/utils/proptypes';

import CpeDetails from './details';

export const ToolBarIcons = ({entity, onCpeDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        anchor="cpe"
        page="managing-secinfo"
        title={_('Help: CPEs')}
      />
      <ListIcon page="cpes" title={_('CPE List')} />
    </IconDivider>
    <ExportIcon
      title={_('Export CPE')}
      value={entity}
      onClick={onCpeDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCpeDownloadClick: PropTypes.func.isRequired,
};

const EntityInfo = ({entity}) => {
  const {id, modificationTime, creationTime, updateTime} = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Modified:')}</div>
      <div>
        {isDefined(modificationTime) ? (
          <DateTime date={modificationTime} />
        ) : (
          _('N/A')
        )}
      </div>
      <div>{_('Created:')}</div>
      <div>
        {isDefined(creationTime) ? <DateTime date={creationTime} /> : _('N/A')}
      </div>
      <div>{_('Last updated:')}</div>
      <div>
        {isDefined(updateTime) ? <DateTime date={updateTime} /> : _('N/A')}
      </div>
    </InfoLayout>
  );
};

EntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Details = ({entity, links = true}) => {
  const {cves, cve_refs} = entity;
  return (
    <Layout flex="column">
      <CpeDetails entity={entity} />
      <DetailsBlock title={_('Reported Vulnerabilities')}>
        {cves.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Name')}</TableHead>
                <TableHead>{_('Severity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cves.map(cve => (
                <TableRow key={cve.id}>
                  <TableData>
                    <span>
                      <DetailsLink id={cve.id} textOnly={!links} type="cve">
                        {cve.id}
                      </DetailsLink>
                    </span>
                  </TableData>
                  <TableData>
                    <SeverityBar severity={cve.severity} />
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : cve_refs === 0 ? (
          _('None')
        ) : (
          <Loading />
        )}
      </DetailsBlock>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const CpePage = ({
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <EntityComponent
    name="cpe"
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
  >
    {({download}) => (
      <EntityPage
        {...props}
        entity={entity}
        infoComponent={EntityInfo}
        sectionIcon={<CpeLogoIcon size="large" />}
        title={_('CPE')}
        toolBarIcons={ToolBarIcons}
        onCpeDownloadClick={download}
        onInteraction={onInteraction}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle title={_('CPE: {{title}}', {title: entity.title})} />
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

CpePage.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('cpe', {
  load: loadEntity,
  entitySelector: selector,
})(CpePage);
