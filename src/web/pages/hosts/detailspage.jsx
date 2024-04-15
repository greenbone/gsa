/* Copyright (C) 2017-2022 Greenbone AG
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

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
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CreateIcon from 'web/entity/icon/createicon';
import DeleteIcon from 'web/entity/icon/deleteicon';
import EditIcon from 'web/entity/icon/editicon';

import {selector as hostsSelector, loadEntity} from 'web/store/entities/hosts';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';

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
    ? bestOsMatchingIdentifier.os.id
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

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const goto_host = goto_details('host', props);
  return (
    <HostComponent
      onTargetCreated={goto_details('target', props)}
      onTargetCreateError={onError}
      onCreated={goto_host}
      onDeleted={goto_list('hosts', props)}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onIdentifierDeleted={onChanged}
      onIdentifierDeleteError={onError}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({create, delete: delete_func, deleteidentifier, download, edit}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<HostIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Host')}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
          onHostCreateClick={create}
          onHostDeleteClick={delete_func}
          onHostDownloadClick={download}
          onHostEditClick={edit}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
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
                    <EntitiesTab entities={permissions}>
                      {_('Permissions')}
                    </EntitiesTab>
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <Details
                        entity={entity}
                        onHostIdentifierDeleteClick={deleteidentifier}
                      />
                    </TabPanel>
                    <TabPanel>
                      <EntityTags
                        entity={entity}
                        onChanged={onChanged}
                        onError={onError}
                        onInteraction={onInteraction}
                      />
                    </TabPanel>
                    <TabPanel>
                      <EntityPermissions
                        entity={entity}
                        permissions={permissions}
                        onChanged={onChanged}
                        onDownloaded={onDownloaded}
                        onError={onError}
                        onInteraction={onInteraction}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Layout>
            );
          }}
        </EntityPage>
      )}
    </HostComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('host', {
  entitySelector: hostsSelector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
