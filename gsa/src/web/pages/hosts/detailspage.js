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
import {useHistory, useParams} from 'react-router-dom';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {hasValue, isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import ExportIcon from 'web/components/icon/exporticon';
import HostIcon from 'web/components/icon/hosticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import OsIcon from 'web/components/icon/osicon';
import ResultIcon from 'web/components/icon/resulticon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityPage, {Col} from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';

import CreateIcon from 'web/entity/icon/createicon';
import DeleteIcon from 'web/entity/icon/deleteicon';
import EditIcon from 'web/entity/icon/editicon';

import {useGetHost} from 'web/graphql/hosts';
import {useGetPermissions} from 'web/graphql/permissions';

import PropTypes from 'web/utils/proptypes';
import {goto_entity_details} from 'web/utils/graphql';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import HostDetails from './details';
import HostComponent from './component';

export const ToolBarIcons = ({
  entity,
  onHostCreateClick,
  onHostDeleteClick,
  onHostDownloadClick,
  onHostEditClick,
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="managing-assets"
          anchor="managing-hosts"
          title={_('Help: Hosts')}
        />
        <ListIcon title={_('Host List')} page="hosts" />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostCreateClick}
        />
        <EditIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostEditClick}
        />
        <DeleteIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Host as XML')}
          onClick={onHostDownloadClick}
        />
      </IconDivider>
      <IconDivider>
        <Link
          to="results"
          filter={'host=' + entity.name}
          title={_('Results for this Host')}
        >
          <ResultIcon />
        </Link>
        <Link
          to="tlsCertificates"
          filter={'host_id=' + entity.id}
          title={_('TLS Certificates for this Host')}
        >
          <TlsCertificateIcon />
        </Link>
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onHostCreateClick: PropTypes.func.isRequired,
  onHostDeleteClick: PropTypes.func.isRequired,
  onHostDownloadClick: PropTypes.func.isRequired,
  onHostEditClick: PropTypes.func.isRequired,
};

const RouteList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const Hop = styled.div`
  display: inline-flex;
  &:not(:last-child) > * {
    padding-right: 5px;
  }
  &:not(:last-child) {
    padding-right: 5px;
  }
  &:not(:last-child)::after {
    content: '►'; /* \u25BA == &#9658; */
  }
`;

const Details = ({entity, ...props}) => {
  const {details = {}, identifiers = [], routes = [], severity} = entity;

  const os_cpe = isDefined(details.best_os_cpe)
    ? details.best_os_cpe.value
    : undefined;
  const os_txt = isDefined(details.best_os_txt)
    ? details.best_os_txt.value
    : undefined;

  const bestOsMatchingIdentifier = identifiers.find(
    identifier => identifier.name === 'OS' && identifier.value === os_cpe,
  );

  const bestMatchingOsId = isDefined(bestOsMatchingIdentifier)
    ? bestOsMatchingIdentifier.os?.id
    : undefined;

  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Hostname')}</TableData>
            <TableData>{entity.hostname}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('IP Address')}</TableData>
            <TableData>{entity.ip}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{entity.comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('OS')}</TableData>
            <TableData>
              <span>
                <DetailsLink
                  type="operatingsystem"
                  textOnly={!isDefined(bestMatchingOsId)}
                  id={bestMatchingOsId}
                >
                  <OsIcon displayOsName osCpe={os_cpe} osTxt={os_txt} />
                </DetailsLink>
              </span>
            </TableData>
          </TableRow>

          {routes.length > 0 && (
            <TableRow>
              <TableData>{_('Route')}</TableData>
              <TableData>
                <RouteList>
                  {routes.map((route, idx) => (
                    <li key={idx}>
                      {route.map(host => (
                        <Hop key={host.ip}>
                          <DetailsLink
                            type="host"
                            id={host.id}
                            textOnly={!isDefined(host.id)}
                          >
                            {host.ip}
                          </DetailsLink>
                        </Hop>
                      ))}
                    </li>
                  ))}
                </RouteList>
              </TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Severity')}</TableData>
            <TableData>
              <SeverityBar severity={severity} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <HostDetails entity={entity} {...props} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = () => {
  // Page methods
  const {id} = useParams();
  const history = useHistory();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [downloadRef, handleDownload] = useDownload();
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  // Load host related entities
  const {host, refetch: refetchHost, loading, error: entityError} = useGetHost(
    id,
  );
  const {permissions = [], refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(host);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchHost,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if host is available and no timer is running yet
    if (hasValue(host) && !hasRunningTimer) {
      startReload();
    }
  }, [host, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  return (
    <HostComponent
      onTargetCreated={goto_entity_details('target', {history})}
      onTargetCreateError={showError}
      onCreated={goto_details('host', {history})}
      onDeleted={goto_list('hosts', {history})}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onIdentifierDeleted={() => refetchHost()}
      onIdentifierDeleteError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={() => refetchHost()}
    >
      {({create, delete: delete_func, deleteidentifier, download, edit}) => (
        <EntityPage
          entity={host}
          entityError={entityError}
          entityType={'host'}
          isLoading={loading}
          sectionIcon={<HostIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Host')}
          onChanged={() => refetchHost()}
          onDownloaded={handleDownload}
          onError={showError}
          onInteraction={renewSessionTimeout}
          onHostCreateClick={create}
          onHostDeleteClick={delete_func}
          onHostDownloadClick={download}
          onHostEditClick={edit}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={host.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <Details
                          entity={host}
                          onHostIdentifierDeleteClick={deleteidentifier}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={host}
                          onChanged={() => refetchHost()}
                          onError={showError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={host}
                          permissions={permissions}
                          onChanged={() => refetchPermissions()}
                          onDownloaded={handleDownload}
                          onError={showError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Layout>
                <DialogNotification
                  {...notificationDialogState}
                  onCloseClick={closeNotificationDialog}
                />
                <Download ref={downloadRef} />
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </HostComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
