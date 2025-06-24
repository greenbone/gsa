/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {DownloadIcon, TlsCertificateIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import DetailsBlock from 'web/entity/Block';
import EntityPage from 'web/entity/EntityPage';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import {goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import TlsCertificateDetails from 'web/pages/tlscertificates/Details';
import TlsCertificateComponent from 'web/pages/tlscertificates/TlsCertificateComponent';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/tlscertificates';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({
  entity,
  onTlsCertificateDeleteClick,
  onTlsCertificateDownloadClick,
  onTlsCertificateExportClick,
}) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-tls-certificates"
          page="managing-assets"
          title={_('Help: TLS Certificate Assets')}
        />
        <ListIcon page="tlscertificates" title={_('TLS Certificates List')} />
      </IconDivider>
      <IconDivider>
        <DeleteIcon entity={entity} onClick={onTlsCertificateDeleteClick} />
        <DownloadIcon
          title={_('Download TLS Certificate as .pem')}
          value={entity}
          onClick={onTlsCertificateDownloadClick}
        />
        <ExportIcon
          title={_('Export TLS Certificate as XML')}
          value={entity}
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
  const [_] = useTranslation();
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
                      {entity.sourceReports.map(report => {
                        return (
                          <DetailsLink
                            key={report.id}
                            id={report.id}
                            type="report"
                          >
                            {report.timestamp}
                          </DetailsLink>
                        );
                      })}
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
                      {entity.sourceHosts.map(host => {
                        return (
                          <DetailsLink key={host.id} id={host.id} type="host">
                            {host.ip}
                          </DetailsLink>
                        );
                      })}
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
                      {entity.sourcePorts.map(port => {
                        return <span key={port}>{port}</span>;
                      })}
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
  const [_] = useTranslation();
  return (
    <TlsCertificateComponent
      onDeleteError={onError}
      onDeleted={goToList('tlscertificates', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
    >
      {({delete: delete_func, download, exportFunc}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<TlsCertificateIcon size="large" />}
          title={_('TLS Certificate')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onTlsCertificateDeleteClick={delete_func}
          onTlsCertificateDownloadClick={download}
          onTlsCertificateExportClick={exportFunc}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('TLS Certificate: {{name}}', {name: entity.name})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
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
                </TabsContainer>
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
