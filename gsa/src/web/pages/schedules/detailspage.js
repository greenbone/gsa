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

import _ from 'gmp/locale';
import {hasValue} from 'gmp/utils/identity';

import useDownload from 'web/components/form/useDownload';

import ExportIcon from 'web/components/icon/exporticon';
import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import Download from 'web/components/form/download';

import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';
import ScheduleIcon from 'web/components/icon/scheduleicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import useExportEntity from 'web/entity/useExportEntity';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';

import {useGetPermissions} from 'web/graphql/permissions';
import {
  useCloneSchedule,
  useDeleteSchedulesByIds,
  useExportSchedulesByIds,
  useGetSchedule,
} from 'web/graphql/schedules';

import {goto_entity_details} from 'web/utils/graphql';
import PropTypes from 'web/utils/proptypes';
import useDefaultReloadInterval from 'web/utils/useDefaultReloadInterval';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import ScheduleComponent from './component';
import ScheduleDetails from './details';

export const ToolBarIcons = ({
  entity,
  onScheduleCloneClick,
  onScheduleCreateClick,
  onScheduleDeleteClick,
  onScheduleDownloadClick,
  onScheduleEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-schedules"
        title={_('Help: Schedules')}
      />
      <ListIcon title={_('Schedules List')} page="schedules" />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onScheduleCreateClick} />
      <CloneIcon entity={entity} onClick={onScheduleCloneClick} />
      <EditIcon entity={entity} onClick={onScheduleEditClick} />
      <TrashIcon entity={entity} onClick={onScheduleDeleteClick} />
      <ExportIcon
        value={entity}
        title={_('Export Schedule as XML')}
        onClick={onScheduleDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScheduleCloneClick: PropTypes.func.isRequired,
  onScheduleCreateClick: PropTypes.func.isRequired,
  onScheduleDeleteClick: PropTypes.func.isRequired,
  onScheduleDownloadClick: PropTypes.func.isRequired,
  onScheduleEditClick: PropTypes.func.isRequired,
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

  // Load schedule related entities
  const {
    schedule,
    refetch: refetchSchedule,
    loading,
    error: entityError,
  } = useGetSchedule(id);
  const {permissions, refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });

  // Schedule related mutations
  const exportEntity = useExportEntity();

  const [cloneSchedule] = useCloneSchedule();
  const [deleteSchedule] = useDeleteSchedulesByIds();
  const exportSchedule = useExportSchedulesByIds();

  // Schedule methods
  const handleCloneSchedule = clonedSchedule => {
    return cloneSchedule(clonedSchedule.id)
      .then(scheduleId =>
        goto_entity_details('schedule', {history})(scheduleId),
      )
      .catch(showError);
  };

  const handleDeleteSchedule = deletedSchedule => {
    return deleteSchedule([deletedSchedule.id])
      .then(goto_list('schedules', {history}))
      .catch(showError);
  };

  const handleDownloadSchedule = exportedSchedule => {
    exportEntity({
      entity: exportedSchedule,
      exportFunc: exportSchedule,
      resourceType: 'schedules',
      onDownload: handleDownload,
      showError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useDefaultReloadInterval();

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchSchedule,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if schedule is available and no timer is running yet
    if (hasValue(schedule) && !hasRunningTimer) {
      startReload();
    }
  }, [schedule, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <ScheduleComponent
      onCloned={goto_details('schedule', {history})}
      onCloneError={showError}
      onCreated={goto_entity_details('schedule', {history})}
      onDeleted={goto_list('schedules', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={() => refetchSchedule()}
    >
      {({create, edit, save}) => (
        <EntityPage
          entity={schedule}
          entityError={entityError}
          entityType={'schedule'}
          isLoading={loading}
          sectionIcon={<ScheduleIcon size="large" />}
          title={_('Schedule')}
          toolBarIcons={ToolBarIcons}
          onInteraction={renewSessionTimeout}
          onScheduleCloneClick={handleCloneSchedule}
          onScheduleCreateClick={create}
          onScheduleDeleteClick={handleDeleteSchedule}
          onScheduleDownloadClick={handleDownloadSchedule}
          onScheduleEditClick={edit}
          onScheduleSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Schedule: {{name}}', {name: schedule.name})}
                />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={schedule.userTags}>
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
                        <ScheduleDetails entity={schedule} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={schedule}
                          onChanged={() => refetchSchedule()}
                          onError={showError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={schedule}
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
    </ScheduleComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
