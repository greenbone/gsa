/* Copyright (C) 2019-2022 Greenbone Networks GmbHH
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

import Divider from 'web/components/layout/divider';
import HorizontalSep from 'web/components/layout/horizontalsep';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DetailsLink from 'web/components/link/detailslink';

import DownloadIcon from 'web/components/icon/downloadicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import EntityPage, {Col} from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import {goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import DeleteIcon from 'web/entity/icon/deleteicon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';

import {selector, loadEntity} from 'web/store/entities/tlscertificates';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';

import TlsCertificateDetails from './details';
import TlsCertificateComponent from './component';

const ToolBarIcons = ({
  entity,
  onTlsCertificateDeleteClick,
  onTlsCertificateDownloadClick,
  onTlsCertificateExportClick,
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="managing-assets"
          anchor="managing-tls-certificates"
          title={_('Help: TLS Certificate Assets')}
        />
        <ListIcon title={_('TLS Certificates List')} page="tlscertificates" />
      </IconDivider>
      <IconDivider>
        <DeleteIcon entity={entity} onClick={onTlsCertificateDeleteClick} />
        <DownloadIcon
          value={entity}
          title={_('Download TLS Certificate as .pem')}
          onClick={onTlsCertificateDownloadClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export TLS Certificate as XML')}
          onClick={onTlsCertificateExportClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTlsCertificateDeleteClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
  onTlsCertificateExportClick: PropTypes.func.isRequired,
};

const Details = ({entity, ...props}) => {
  const showSourceBlock =
    entity.sourceReports.length > 0 || entity.sourceHosts.length > 0;
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Name')}</TableData>
            <TableData>{entity.name}</TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <TlsCertificateDetails entity={entity} {...props} />

      {showSourceBlock && (
        <DetailsBlock title={_('Sources')}>
          {entity.sourceReports.length > 0 && (
            <InfoTable size="full">
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableDataAlignTop>{_('Reports')}</TableDataAlignTop>
                  <TableData>
                    <HorizontalSep>
                      {entity.sourceReports.map(report => (
                        <DetailsLink
                          key={report.id}
                          id={report.id}
                          type="report"
                        >
                          {report.timestamp}
                        </DetailsLink>
                      ))}
                    </HorizontalSep>
                  </TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          )}
          {entity.sourceHosts.length > 0 && (
            <InfoTable size="full">
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableDataAlignTop>{_('Hosts')}</TableDataAlignTop>
                  <TableData>
                    <HorizontalSep>
                      {entity.sourceHosts.map(host => (
                        <DetailsLink key={host.id} id={host.id} type="host">
                          {host.ip}
                        </DetailsLink>
                      ))}
                    </HorizontalSep>
                  </TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          )}
          {entity.sourcePorts.length > 0 && (
            <InfoTable size="full">
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableDataAlignTop>{_('Ports')}</TableDataAlignTop>
                  <TableData>
                    <HorizontalSep>
                      {entity.sourcePorts.map(port => (
                        <span key={port}>{port}</span>
                      ))}
                    </HorizontalSep>
                  </TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          )}
        </DetailsBlock>
      )}
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
  return (
    <TlsCertificateComponent
      onDeleted={goto_list('tlscertificates', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={onInteraction}
    >
      {({delete: delete_func, download, exportFunc}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<TlsCertificateIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('TLS Certificate')}
          onInteraction={onInteraction}
          onTlsCertificateDeleteClick={delete_func}
          onTlsCertificateDownloadClick={download}
          onTlsCertificateExportClick={exportFunc}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('TLS Certificate: {{name}}', {name: entity.name})}
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
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
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
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </TlsCertificateComponent>
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

export default withEntityContainer('tlscertificate', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
