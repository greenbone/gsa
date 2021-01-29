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
import {hasValue} from 'gmp/utils/identity';

import DetailsLink from 'web/components/link/detailslink';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import ListIcon from 'web/components/icon/listicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';

import Link from 'web/components/link/link';

import StripedTable from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';
import useDownload from 'web/components/form/useDownload';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import useReload from 'web/components/loading/useReload';
import DialogNotification from 'web/components/notification/dialognotification';
import Download from 'web/components/form/download';

import {
  useCloneScanConfig,
  useDeleteScanConfig,
  useExportScanConfigsByIds,
  useGetScanConfig,
} from 'web/graphql/scanconfigs';
import {useGetPermissions} from 'web/graphql/permissions';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import useExportEntity from 'web/entity/useExportEntity';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import {goto_entity_details} from 'web/utils/graphql';

import ScanConfigDetails from './details';
import ScanConfigComponent from './component';
import Trend from './trend';

export const ToolBarIcons = ({
  entity,
  onScanConfigCloneClick,
  onScanConfigCreateClick,
  onScanConfigDeleteClick,
  onScanConfigDownloadClick,
  onScanConfigEditClick,
  onScanConfigImportClick,
}) => {
  const capabilities = useCapabilities();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="scanning"
          anchor="managing-scan-configurations"
          title={_('Help: ScanConfigs')}
        />
        <ListIcon title={_('ScanConfig List')} page="scanconfigs" />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onScanConfigCreateClick} />
        <CloneIcon entity={entity} onClick={onScanConfigCloneClick} />
        <EditIcon
          entity={entity}
          disabled={entity.predefined}
          onClick={onScanConfigEditClick}
        />
        <TrashIcon entity={entity} onClick={onScanConfigDeleteClick} />
        <ExportIcon
          value={entity}
          title={_('Export Scan Config as XML')}
          onClick={onScanConfigDownloadClick}
        />
        {capabilities.mayCreate('config') && (
          <UploadIcon
            title={_('Import Scan Config')}
            onClick={onScanConfigImportClick}
          />
        )}
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScanConfigCloneClick: PropTypes.func.isRequired,
  onScanConfigCreateClick: PropTypes.func.isRequired,
  onScanConfigDeleteClick: PropTypes.func.isRequired,
  onScanConfigDownloadClick: PropTypes.func.isRequired,
  onScanConfigEditClick: PropTypes.func.isRequired,
  onScanConfigImportClick: PropTypes.func.isRequired,
};

export const NvtFamilies = ({entity}) => {
  const {familyList = [], families} = entity;
  return (
    <Layout>
      {familyList.length > 0 && (
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Family')}</TableHead>
              <TableHead>{_('NVTs selected')}</TableHead>
              <TableHead align={['center', 'center']}>
                <Divider>
                  {_('Trend')}
                  <Trend
                    trend={families.trend}
                    titleDynamic={_(
                      'The families selection is DYNAMIC. New ' +
                        'families will automatically be added and considered.',
                    )}
                    titleStatic={_(
                      'The families selection is STATIC. New ' +
                        'families will NOT automatically be added and considered.',
                    )}
                  />
                </Divider>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {familyList.map(family => (
              <TableRow key={family.name}>
                <TableData>
                  <span>
                    <Link
                      to="nvts"
                      filter={'family="' + family.name + '"'}
                      title={_('NVTs of family {{name}}', {name: family.name})}
                    >
                      {family.name}
                    </Link>
                  </span>
                </TableData>
                <TableData align={['center', 'start']}>
                  <Layout>{_('{{count}} of {{max}}', family.nvts)}</Layout>
                </TableData>
                <TableData align={['center', 'center']}>
                  <Trend
                    trend={family.trend}
                    titleDynamic={_(
                      'The NVT selection is DYNAMIC. New ' +
                        'NVTs will automatically be added and considered.',
                    )}
                    titleStatic={_(
                      'The NVT selection is STATIC. New ' +
                        'NVTs will NOT automatically be added and considered.',
                    )}
                  />
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      )}
    </Layout>
  );
};

NvtFamilies.propTypes = {
  entity: PropTypes.model.isRequired,
};

export const ScannerPreferences = ({entity}) => {
  const {preferences} = entity;

  return (
    <Layout>
      {preferences.scanner.length > 0 && (
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Name')}</TableHead>
              <TableHead>{_('Value')}</TableHead>
              <TableHead>{_('Default Value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.scanner.map(pref => (
              <TableRow key={pref.name}>
                <TableData>{pref.name}</TableData>
                <TableData>{pref.value}</TableData>
                <TableData>{pref.default}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      )}
    </Layout>
  );
};

ScannerPreferences.propTypes = {
  entity: PropTypes.model.isRequired,
};

const StyledTableData = styled(TableData)`
  word-break: break-all;
`;

export const NvtPreferences = ({entity}) => {
  const {preferences} = entity;

  return (
    <Layout>
      {preferences.nvt.length > 0 && (
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead width="25%">{_('NVT')}</TableHead>
              <TableHead width="25%">{_('Name')}</TableHead>
              <TableHead width="15%">{_('Value')}</TableHead>
              <TableHead>{_('Default Value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.nvt.map(pref => (
              <TableRow key={pref.nvt.oid + pref.nvt.name + pref.name}>
                <TableData>
                  <span>
                    <DetailsLink id={pref.nvt.oid} type="nvt">
                      {pref.nvt.name}
                    </DetailsLink>
                  </span>
                </TableData>
                <TableData>{pref.name}</TableData>
                <StyledTableData>{pref.value}</StyledTableData>
                <StyledTableData>{pref.default}</StyledTableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      )}
    </Layout>
  );
};

NvtPreferences.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Details = ({entity, ...props}) => {
  return (
    <Layout flex="column">
      <ScanConfigDetails entity={entity} {...props} />
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

  // Load scanConfig related entities
  const {
    scanConfig,
    refetch: refetchScanConfig,
    loading,
    error: entityError,
  } = useGetScanConfig(id, {fetchPolicy: 'no-cache'}); // if we allow caching, all scanner preferences will be parsed as auto_enable_dependencies
  const {permissions = [], refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });

  // ScanConfig related mutations
  const exportEntity = useExportEntity();

  const [cloneScanConfig] = useCloneScanConfig();
  const [deleteScanConfig] = useDeleteScanConfig();
  const exportScanConfig = useExportScanConfigsByIds();

  // ScanConfig methods
  const handleCloneScanConfig = clonedScanConfig => {
    return cloneScanConfig(clonedScanConfig.id)
      .then(scanConfigId =>
        goto_entity_details('scanconfig', {history})(scanConfigId),
      )
      .catch(showError);
  };

  const handleDeleteScanConfig = deletedScanConfig => {
    return deleteScanConfig(deletedScanConfig.id)
      .then(goto_list('scanconfigs', {history}))
      .catch(showError);
  };

  const handleDownloadScanConfig = exportedScanConfig => {
    exportEntity({
      entity: exportedScanConfig,
      exportFunc: exportScanConfig,
      resourceType: 'scanConfigs',
      onDownload: handleDownload,
      showError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(scanConfig);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchScanConfig,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if scanConfig is available and no timer is running yet
    if (hasValue(scanConfig) && !hasRunningTimer) {
      startReload();
    }
  }, [scanConfig, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <ScanConfigComponent
      onCloned={goto_entity_details('scanconfig', {history})}
      onCloneError={showError}
      onCreated={goto_entity_details('scanconfig', {history})} // replace with goto_entity_details later
      onDeleted={goto_list('scanconfigs', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onImported={goto_details('scanconfig', {history})}
      onInteraction={renewSessionTimeout}
      onSaved={() => refetchScanConfig()}
    >
      {({create, edit, import: import_func, save}) => (
        <EntityPage
          entity={scanConfig}
          entityError={entityError}
          entityType={'scanconfig'}
          isLoading={loading}
          sectionIcon={<ScanConfigIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Scan Config')}
          onInteraction={renewSessionTimeout}
          onScanConfigCloneClick={handleCloneScanConfig}
          onScanConfigCreateClick={create}
          onScanConfigDeleteClick={handleDeleteScanConfig}
          onScanConfigDownloadClick={handleDownloadScanConfig}
          onScanConfigEditClick={edit}
          onScanConfigSaveClick={save}
          onScanConfigImportClick={import_func}
        >
          {({activeTab = 0, onActivateTab}) => {
            const {preferences} = scanConfig;
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Scan Config: {{name}}', {name: scanConfig.name})}
                />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={preferences.scanner}>
                        {_('Scanner Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={scanConfig.familyList}>
                        {_('NVT Families')}
                      </EntitiesTab>
                      <EntitiesTab entities={preferences.nvt}>
                        {_('NVT Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={scanConfig.userTags}>
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
                        <Details entity={scanConfig} />
                      </TabPanel>
                      <TabPanel>
                        <ScannerPreferences entity={scanConfig} />
                      </TabPanel>
                      <TabPanel>
                        <NvtFamilies entity={scanConfig} />
                      </TabPanel>
                      <TabPanel>
                        <NvtPreferences entity={scanConfig} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={scanConfig}
                          onChanged={() => refetchScanConfig()}
                          onError={showError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={scanConfig}
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
    </ScanConfigComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
