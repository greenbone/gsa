/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import SeverityBar from 'web/components/bar/SeverityBar';
import ExportIcon from 'web/components/icon/ExportIcon';
import HostIcon from 'web/components/icon/HostIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import OsIcon from 'web/components/icon/OsIcon';
import ResultIcon from 'web/components/icon/ResultIcon';
import TlsCertificateIcon from 'web/components/icon/TlsCertificateIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import EntityPage from 'web/entity/EntityPage';
import CreateIcon from 'web/entity/icon/CreateIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import HostComponent from 'web/pages/hosts/Component';
import HostDetails from 'web/pages/hosts/Details';
import {selector as hostsSelector, loadEntity} from 'web/store/entities/hosts';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';

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
          anchor="managing-hosts"
          page="managing-assets"
          title={_('Help: Hosts')}
        />
        <ListIcon page="hosts" title={_('Host List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          displayName={_('Host')}
          entity={entity}
          onClick={onHostCreateClick}
        />
        <EditIcon
          displayName={_('Host')}
          entity={entity}
          onClick={onHostEditClick}
        />
        <DeleteIcon
          displayName={_('Host')}
          entity={entity}
          onClick={onHostDeleteClick}
        />
        <ExportIcon
          title={_('Export Host as XML')}
          value={entity}
          onClick={onHostDownloadClick}
        />
      </IconDivider>
      <IconDivider>
        <Link
          filter={'host=' + entity.name}
          title={_('Results for this Host')}
          to="results"
        >
          <ResultIcon />
        </Link>
        <Link
          filter={'host_id=' + entity.id}
          title={_('TLS Certificates for this Host')}
          to="tlsCertificates"
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
                  id={bestMatchingOsId}
                  textOnly={!isDefined(bestMatchingOsId)}
                  type="operatingsystem"
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
                            id={host.id}
                            textOnly={!isDefined(host.id)}
                            type="host"
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
  const goto_host = goToDetails('host', props);
  return (
    <HostComponent
      onCreated={goto_host}
      onDeleted={goToList('hosts', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onIdentifierDeleteError={onError}
      onIdentifierDeleted={onChanged}
      onInteraction={onInteraction}
      onSaved={onChanged}
      onTargetCreateError={onError}
      onTargetCreated={goToDetails('target', props)}
    >
      {({create, delete: delete_func, deleteidentifier, download, edit}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<HostIcon size="large" />}
          title={_('Host')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onHostCreateClick={create}
          onHostDeleteClick={delete_func}
          onHostDownloadClick={download}
          onHostEditClick={edit}
          onInteraction={onInteraction}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
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
