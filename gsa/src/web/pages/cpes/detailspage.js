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
import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';

import {useExportCpesByIds, useGetCpe} from 'web/graphql/cpes';

import {hasValue} from 'gmp/utils/identity';

import _ from 'gmp/locale';
import DateTime from 'web/components/date/datetime';

import SeverityBar from 'web/components/bar/severitybar';

import CpeLogoIcon from 'web/components/icon/cpelogoicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import useDialogNotification from 'web/components/notification/useDialogNotification';
import useReload from 'web/components/loading/useReload';

import useDownload from 'web/components/form/useDownload';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';
import Download from 'web/components/form/download';

import DetailsLink from 'web/components/link/detailslink';

import Loading from 'web/components/loading/loading';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Table from 'web/components/table/stripedtable';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import DetailsBlock from 'web/entity/block';
import EntityPage from 'web/entity/page';
import EntityComponent from 'web/entity/component';
import {InfoLayout} from 'web/entity/info';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import useExportEntity from 'web/entity/useExportEntity';

import PropTypes from 'web/utils/proptypes';

import CpeDetails from './details';

export const ToolBarIcons = ({entity, onCpeDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="managing-secinfo"
        anchor="cpe"
        title={_('Help: CPEs')}
      />
      <ListIcon title={_('CPE List')} page="cpes" />
    </IconDivider>
    <ExportIcon
      value={entity}
      title={_('Export CPE')}
      onClick={onCpeDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCpeDownloadClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  const {cveRefs, cveRefCount} = entity;
  return (
    <Layout flex="column">
      <CpeDetails entity={entity} />
      <DetailsBlock title={_('Reported Vulnerabilities')}>
        {cveRefCount > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Name')}</TableHead>
                <TableHead>{_('Severity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cveRefs.map(cve => (
                <TableRow key={cve.id}>
                  <TableData>
                    <span>
                      <DetailsLink id={cve.id} type="cve" textOnly={!links}>
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
        ) : cveRefCount === 0 ? (
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

const EntityInfo = ({entity}) => {
  const {id, modificationTime, creationTime, updateTime} = entity;
  return (
    <InfoLayout>
      <div>{_('ID:')}</div>
      <div>{id}</div>
      <div>{_('Modified:')}</div>
      <div>
        <DateTime date={modificationTime} />
      </div>
      <div>{_('Created:')}</div>
      <div>
        <DateTime date={creationTime} />
      </div>
      <div>{_('Last updated:')}</div>
      <div>
        <DateTime date={updateTime} />
      </div>
    </InfoLayout>
  );
};

EntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = () => {
  // Page methods
  const {id} = useParams();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [downloadRef, handleDownload] = useDownload();
  const {showError} = useDialogNotification();

  // Load cpe related entities
  const {cpe, refetch: refetchCpe, loading, error: entityError} = useGetCpe(
    decodeURIComponent(id),
  );

  // Cpe related mutations
  const exportEntity = useExportEntity();
  const exportCpe = useExportCpesByIds();

  // Cpe methods
  const handleDownloadCpe = exportedCpe => {
    exportEntity({
      entity: exportedCpe,
      exportFunc: exportCpe,
      resourceType: 'cpes',
      onDownload: handleDownload,
      showError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(cpe);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchCpe,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if cpe is available and no timer is running yet
    if (hasValue(cpe) && !hasRunningTimer) {
      startReload();
    }
  }, [cpe, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  return (
    <EntityComponent
      name="cpe"
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
    >
      {({download}) => (
        <EntityPage
          entity={cpe}
          entityError={entityError}
          entityType={'cpe'}
          isLoading={loading}
          sectionIcon={<CpeLogoIcon size="large" />}
          title={_('CPE')}
          infoComponent={EntityInfo}
          toolBarIcons={ToolBarIcons}
          onCpeDownloadClick={handleDownloadCpe}
          onInteraction={renewSessionTimeout}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('CPE: {{title}}', {title: cpe.title})} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={cpe.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <Details entity={cpe} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={cpe}
                          onChanged={() => refetchCpe()}
                          onError={showError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Layout>
                <Download ref={downloadRef} />
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </EntityComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
