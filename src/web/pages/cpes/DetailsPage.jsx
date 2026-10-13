/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import useDownload from 'web/components/form/useDownload';
import {CpeLogoIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Loading from 'web/components/loading/Loading';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/DetailsBlock';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityComponent from 'web/entity/EntityComponent';
import {EntityInfoTable} from 'web/entity/EntityInfo';
import EntityPage from 'web/entity/EntityPage';
import EntityTags from 'web/entity/Tags';
import useGetCpe from 'web/hooks/use-query/cpe';
import useTranslation from 'web/hooks/useTranslation';
import CpeDetailsPageToolBarIcons from 'web/pages/cpes/CpeDetailsPageToolBarIcons';
import CpeDetails from 'web/pages/cpes/Details';
import PropTypes from 'web/utils/prop-types';

const CpeEntityInfo = ({entity}) => {
  const [_] = useTranslation();
  const {id, modificationTime, creationTime, updateTime} = entity;
  return (
    <EntityInfoTable data-testid="entity-info">
      <tbody>
        <tr>
          <td>{_('ID:')}</td>
          <td>{id}</td>
        </tr>
        <tr>
          <td>{_('Modified:')}</td>
          <td>
            {isDefined(modificationTime) ? (
              <DateTime date={modificationTime} />
            ) : (
              _('N/A')
            )}
          </td>
        </tr>
        <tr>
          <td>{_('Created:')}</td>
          <td>
            {isDefined(creationTime) ? (
              <DateTime date={creationTime} />
            ) : (
              _('N/A')
            )}
          </td>
        </tr>
        <tr>
          <td>{_('Last updated:')}</td>
          <td>
            {isDefined(updateTime) ? <DateTime date={updateTime} /> : _('N/A')}
          </td>
        </tr>
      </tbody>
    </EntityInfoTable>
  );
};

CpeEntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Details = ({entity, links = true}) => {
  const [_] = useTranslation();
  const {cves, cveRefs} = entity;
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
              {cves.map(cve => {
                return (
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
                );
              })}
            </TableBody>
          </Table>
        ) : cveRefs === 0 ? (
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

const CpePage = () => {
  const [_] = useTranslation();
  const {id: routeId} = useParams();
  const id = routeId ? decodeURIComponent(routeId) : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const {downloadComponent, download: handleDownload} = useDownload();
  const {data, error, isLoading} = useGetCpe({id});
  const entity = data?.cpe;
  const candidateFilter = data?.candidateFilter;

  useEffect(() => {
    if (candidateFilter) {
      void navigate(`/cpes?filter=${encodeURIComponent(candidateFilter)}`, {
        replace: true,
      });
    }
  }, [candidateFilter, navigate]);

  const entityError = error
    ? {status: error.status ?? 0, message: error.message}
    : undefined;
  const onChanged = () => {
    void queryClient.invalidateQueries({queryKey: ['get_cpe']});
  };
  const onError = error => showError(error);

  return (
    <>
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
      {downloadComponent}
      <EntityComponent
        name="cpe"
        onDownloadError={onError}
        onDownloaded={handleDownload}
      >
        {({download}) => (
          <EntityPage
            entity={entity}
            entityError={entityError}
            entityType="cpe"
            infoComponent={CpeEntityInfo}
            isLoading={isLoading || Boolean(candidateFilter)}
            sectionIcon={<CpeLogoIcon size="large" />}
            title={_('CPE')}
            toolBarIcons={CpeDetailsPageToolBarIcons}
            onCpeDownloadClick={download}
          >
            {() => {
              return (
                <>
                  <PageTitle
                    title={_('CPE: {{title}}', {title: entity.title})}
                  />
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
                          />
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </TabsContainer>
                </>
              );
            }}
          </EntityPage>
        )}
      </EntityComponent>
    </>
  );
};

export default CpePage;
