/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import React, {useCallback, useEffect} from 'react';
import {useParams} from 'react-router-dom';

import _ from 'gmp/locale';
import {hasValue} from 'gmp/utils/identity';

import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';
import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';
import useReload from 'web/components/loading/useReload';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useExportEntity from 'web/entity/useExportEntity';

import AlertIcon from 'web/components/icon/alerticon';
import ExportIcon from 'web/components/icon/exporticon';
import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {
  useGetAlert,
  useCloneAlert,
  useDeleteAlert,
  useExportAlertsByIds,
} from 'web/graphql/alerts';
import {useGetPermissions} from 'web/graphql/permissions';
import {useGetReportFormats} from 'web/graphql/report_formats';

import {selector} from 'web/store/entities/alerts';

import PropTypes from 'web/utils/proptypes';
import {goto_entity_details} from 'web/utils/graphql';
import useGmpSettings from 'web/utils/useGmpSettings';

import AlertComponent from './component';
import AlertDetails from './details';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

export const ToolBarIcons = ({
  entity,
  onAlertCloneClick,
  onAlertCreateClick,
  onAlertDeleteClick,
  onAlertDownloadClick,
  onAlertEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-alerts"
        title={_('Help: Alerts')}
      />
      <ListIcon title={_('Alerts List')} page="alerts" />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onAlertCreateClick} />
      <CloneIcon entity={entity} onClick={onAlertCloneClick} />
      <EditIcon entity={entity} onClick={onAlertEditClick} />
      <TrashIcon entity={entity} onClick={onAlertDeleteClick} />
      <ExportIcon
        value={entity}
        title={_('Export Alert as XML')}
        onClick={onAlertDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onAlertCloneClick: PropTypes.func.isRequired,
  onAlertCreateClick: PropTypes.func.isRequired,
  onAlertDeleteClick: PropTypes.func.isRequired,
  onAlertDownloadClick: PropTypes.func.isRequired,
  onAlertEditClick: PropTypes.func.isRequired,
};

const Page = ({onError, ...props}) => {
  // Page methods
  const {id} = useParams();
  const gmpSettings = useGmpSettings();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [downloadRef, handleDownload] = useDownload();
  const {
    alert,
    refetch: refetchAlert,
    loading,
    error: entityError,
  } = useGetAlert(id);
  const {permissions, refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });
  const {reportFormats = []} = useGetReportFormats();

  // Alert related mutations
  const exportEntity = useExportEntity();

  const [cloneAlert] = useCloneAlert();
  const [deleteAlert] = useDeleteAlert();
  const exportAlert = useExportAlertsByIds();

  // Alert methods
  const handleCloneAlert = clonedAlert => {
    return cloneAlert(clonedAlert.id)
      .then(alertId => goto_entity_details('alert', props)(alertId))
      .catch(onError);
  };

  const handleDeleteAlert = deletedAlert => {
    return deleteAlert(deletedAlert.id)
      .then(goto_list('alerts', props))
      .catch(onError);
  };

  const handleDownloadAlert = exportedAlert => {
    exportEntity({
      entity: exportedAlert,
      exportFunc: exportAlert,
      resourceType: 'alerts',
      onDownload: handleDownload,
      onError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useCallback(
    ({isVisible}) => {
      if (!isVisible) {
        return gmpSettings.reloadIntervalInactive;
      }
      if (alert.isActive()) {
        return gmpSettings.reloadIntervalActive;
      }
      return gmpSettings.reloadInterval;
    },
    [alert, gmpSettings],
  );

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchAlert,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if alert is available and no timer is running yet
    if (hasValue(alert) && !hasRunningTimer) {
      startReload();
    }
  }, [alert, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <AlertComponent
      onCloned={goto_details('alert', props)}
      onCloneError={onError}
      onCreated={goto_entity_details('alert', props)}
      onDeleted={goto_list('alerts', props)}
      onDeleteError={onError}
      onDownloaded={handleDownload}
      onDownloadError={onError}
      onInteraction={renewSessionTimeout}
      onSaved={() => refetchAlert()}
    >
      {({create, edit, save}) => (
        <EntityPage
          {...props}
          entity={alert}
          entityError={entityError}
          isLoading={loading}
          sectionIcon={<AlertIcon size="large" />}
          title={_('Alert')}
          toolBarIcons={ToolBarIcons}
          onAlertCloneClick={handleCloneAlert}
          onAlertCreateClick={create}
          onAlertDeleteClick={handleDeleteAlert}
          onAlertDownloadClick={handleDownloadAlert}
          onAlertEditClick={edit}
          onAlertSaveClick={save}
          onInteraction={renewSessionTimeout}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Alert: {{name}}', {name: alert.name})} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={alert.userTags}>
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
                        <AlertDetails
                          entity={alert}
                          reportFormats={reportFormats}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={alert}
                          onChanged={() => refetchAlert()} // Must be called like this instead of simply onChanged={refetchAlert} because we don't want this query to be called with new arguments on tag related actions
                          onError={onError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={alert}
                          permissions={permissions}
                          onChanged={() => refetchPermissions()} // Same here, for permissions. We want same query variables.
                          onDownloaded={handleDownload}
                          onError={onError}
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
    </AlertComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const load = gmp => id => dispatch => Promise.resolve(); // Must keep this for now before we can get rid of withEntityContainer

export default withEntityContainer('alert', {
  entitySelector: selector,
  load,
  undefined,
})(Page);

// vim: set ts=2 sw=2 tw=80:
