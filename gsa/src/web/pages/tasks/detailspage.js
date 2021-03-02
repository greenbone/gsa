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
/* eslint-disable react-hooks/exhaustive-deps */

import React, {useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

import {TARGET_CREDENTIAL_NAMES} from 'gmp/models/target';

import {hasValue} from 'gmp/utils/identity';

import Badge from 'web/components/badge/badge';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import AlterableIcon from 'web/components/icon/alterableicon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import NoteIcon from 'web/components/icon/noteicon';
import OverrideIcon from 'web/components/icon/overrideicon';
import ReportIcon from 'web/components/icon/reporticon';
import ResultIcon from 'web/components/icon/resulticon';
import TaskIcon from 'web/components/icon/taskicon';

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

import useDownload from 'web/components/form/useDownload';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import DialogNotification from 'web/components/notification/dialognotification';
import Download from 'web/components/form/download';

import EntityPage, {Col} from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';
import useExportEntity from 'web/entity/useExportEntity';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {useLazyGetNotes} from 'web/graphql/notes';
import {useLazyGetOverrides} from 'web/graphql/overrides';

import {
  useCloneTask,
  useDeleteTask,
  useExportTasksByIds,
  useGetTask,
} from 'web/graphql/tasks';
import {useGetPermissions} from 'web/graphql/permissions';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withComponentDefaults from 'web/utils/withComponentDefaults';
import {goto_entity_details} from 'web/utils/graphql';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import ImportReportIcon from './icons/importreporticon';
import NewIconMenu from './icons/newiconmenu';
import ResumeIcon from './icons/resumeicon';
import ScheduleIcon from './icons/scheduleicon';
import StartIcon from './icons/starticon';
import StopIcon from './icons/stopicon';

import TaskDetails from './details';
import TaskStatus from './status';
import TaskComponent from './component';

export const ToolBarIcons = ({
  entity,
  links,
  notes = [],
  overrides = [],
  onTaskDeleteClick,
  onTaskCloneClick,
  onTaskDownloadClick,
  onTaskEditClick,
  onReportImportClick,
  onTaskCreateClick,
  onContainerTaskCreateClick,
  onTaskStartClick,
  onTaskStopClick,
  onTaskResumeClick,
  ...props
}) => {
  const reportsCounts = entity.reports.counts;
  const currentResults = entity.results?.counts?.current;
  const {lastReport, currentReport} = entity.reports;
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          page="scanning"
          anchor="managing-tasks"
          title={_('Help: Tasks')}
        />
        <ListIcon title={_('Task List')} page="tasks" />
        {entity.isAlterable() && !entity.isNew() && (
          <AlterableIcon
            title={_(
              'This is an Alterable Task. Reports may not relate to ' +
                'current Scan Config or Target!',
            )}
          />
        )}
      </IconDivider>

      <IconDivider>
        <NewIconMenu
          onNewClick={onTaskCreateClick}
          onNewContainerClick={onContainerTaskCreateClick}
        />
        <CloneIcon entity={entity} name="task" onClick={onTaskCloneClick} />
        <EditIcon entity={entity} name="task" onClick={onTaskEditClick} />
        <TrashIcon entity={entity} name="task" onClick={onTaskDeleteClick} />
        <ExportIcon
          value={entity}
          title={_('Export Task as XML')}
          onClick={onTaskDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {hasValue(entity.schedule) && (
          <ScheduleIcon
            schedule={entity.schedule}
            schedulePeriods={entity.schedule_periods}
            links={links}
          />
        )}
        <StartIcon task={entity} onClick={onTaskStartClick} />

        <ImportReportIcon task={entity} onClick={onReportImportClick} />

        <StopIcon task={entity} onClick={onTaskStopClick} />

        {!entity.isContainer() && (
          <ResumeIcon task={entity} onClick={onTaskResumeClick} />
        )}
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {hasValue(currentReport) && (
            <DetailsLink
              type="report"
              id={currentReport.id}
              title={_('Current Report for Task {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(currentReport.scanStart),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}
          {!hasValue(currentReport) && hasValue(lastReport) && (
            <DetailsLink
              type="report"
              id={lastReport.id}
              title={_('Last Report for Task {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(lastReport.scanStart),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          <Link
            to="reports"
            filter={'task_id=' + entity.id}
            title={_('Total Reports for Task {{- name}}', entity)}
          >
            <Badge content={reportsCounts.total}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          to="results"
          filter={'task_id=' + entity.id}
          title={_('Results for Task {{- name}}', entity)}
        >
          <Badge content={currentResults}>
            <ResultIcon />
          </Badge>
        </Link>

        <IconDivider>
          <Link
            to="notes"
            filter={'task_id=' + entity.id}
            title={_('Notes for Task {{- name}}', entity)}
          >
            <Badge content={notes.length}>
              <NoteIcon />
            </Badge>
          </Link>

          <Link
            to="overrides"
            filter={'task_id=' + entity.id}
            title={_('Overrides for Task {{- name}}', entity)}
          >
            <Badge content={overrides.length}>
              <OverrideIcon />
            </Badge>
          </Link>
        </IconDivider>
      </Divider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  notes: PropTypes.array,
  overrides: PropTypes.array,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onReportImportClick: PropTypes.func.isRequired,
  onTaskCloneClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskDeleteClick: PropTypes.func.isRequired,
  onTaskDownloadClick: PropTypes.func.isRequired,
  onTaskEditClick: PropTypes.func.isRequired,
  onTaskResumeClick: PropTypes.func.isRequired,
  onTaskStartClick: PropTypes.func.isRequired,
  onTaskStopClick: PropTypes.func.isRequired,
};

const Details = ({entity, ...props}) => {
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

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{entity.comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Alterable')}</TableData>
            <TableData>{renderYesNo(entity.isAlterable())}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Status')}</TableData>
            <TableData>
              <TaskStatus task={entity} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <TaskDetails entity={entity} {...props} />
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

  // Load task related entities
  const {task, refetch: refetchTask, loading, error: entityError} = useGetTask(
    id,
  );
  const {permissions = [], refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });
  const [loadNotes, {notes}] = useLazyGetNotes({
    filterString: 'task_id:' + id,
  });

  const [loadOverrides, {overrides}] = useLazyGetOverrides({
    filterString: 'task_id:' + id,
  });

  // Task related mutations
  const exportEntity = useExportEntity();

  const [cloneTask] = useCloneTask();
  const [deleteTask] = useDeleteTask();
  const exportTask = useExportTasksByIds();

  // Task methods
  const handleCloneTask = clonedTask => {
    return cloneTask(clonedTask.id)
      .then(taskId => goto_entity_details('task', {history})(taskId))
      .catch(showError);
  };

  const handleDeleteTask = deletedTask => {
    return deleteTask(deletedTask.id)
      .then(goto_list('tasks', {history}))
      .catch(showError);
  };

  const handleDownloadTask = exportedTask => {
    exportEntity({
      entity: exportedTask,
      exportFunc: exportTask,
      resourceType: 'tasks',
      onDownload: handleDownload,
      showError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(task);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchTask,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if task is available and no timer is running yet
    if (hasValue(task) && !hasRunningTimer) {
      startReload();
    }
  }, [task, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  // Other side effects
  useEffect(() => {
    if (hasValue(task) && task.usageType === 'audit') {
      return history.replace(`/audit/${task.id}`);
    }
  }, [history]);

  useEffect(() => {
    loadNotes();
    loadOverrides();
  }, [id]);

  return (
    <TaskComponent
      onCloned={goto_details('task', {history})}
      onCloneError={showError}
      onCreated={goto_entity_details('task', {history})}
      onContainerCreated={goto_entity_details('task', {history})}
      onContainerSaved={() => refetchTask()}
      onDeleted={goto_list('tasks', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onReportImported={() => refetchTask()}
      onResumed={() => refetchTask()}
      onResumeError={showError}
      onSaved={() => refetchTask()}
      onStarted={() => refetchTask()}
      onStartError={showError}
      onStopped={() => refetchTask()}
      onStopError={showError}
    >
      {({create, createcontainer, edit, start, stop, resume, reportimport}) => {
        return (
          <EntityPage
            entity={task}
            entityError={entityError}
            entityType={'task'}
            isLoading={loading}
            notes={notes}
            overrides={overrides}
            sectionIcon={<TaskIcon size="large" />}
            title={_('Task')}
            toolBarIcons={ToolBarIcons}
            onChanged={() => refetchTask()}
            onContainerTaskCreateClick={createcontainer}
            onError={showError}
            onInteraction={renewSessionTimeout}
            onReportImportClick={reportimport}
            onTaskCloneClick={handleCloneTask} // Clone is special because TaskComponent doesn't define it, so I'm assuming that EntityComponent is passing this method instead
            onTaskCreateClick={create}
            onTaskDeleteClick={handleDeleteTask}
            onTaskDownloadClick={handleDownloadTask}
            onTaskEditClick={edit}
            onTaskResumeClick={resume}
            onTaskStartClick={start}
            onTaskStopClick={stop}
          >
            {({activeTab = 0, onActivateTab}) => {
              return (
                <React.Fragment>
                  <PageTitle title={_('Task: {{name}}', {name: task.name})} />
                  <Layout grow="1" flex="column">
                    <TabLayout grow="1" align={['start', 'end']}>
                      <TabList
                        active={activeTab}
                        align={['start', 'stretch']}
                        onActivateTab={onActivateTab}
                      >
                        <Tab>{_('Information')}</Tab>
                        <EntitiesTab entities={task.userTags}>
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
                          <Details entity={task} />
                        </TabPanel>
                        <TabPanel>
                          <EntityTags
                            entity={task}
                            onChanged={() => refetchTask()}
                            onError={showError}
                            onInteraction={renewSessionTimeout}
                          />
                        </TabPanel>
                        <TabPanel>
                          <TaskPermissions
                            entity={task}
                            permissions={permissions}
                            onChanged={() => refetchPermissions()}
                            onDownloaded={handleDownload}
                            onInteraction={renewSessionTimeout}
                            onError={showError}
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
        );
      }}
    </TaskComponent>
  );
};

export const TaskPermissions = withComponentDefaults({
  relatedResourcesLoaders: [
    ({entity, gmp}) =>
      hasValue(entity.alerts)
        ? Promise.resolve([...entity.alerts])
        : Promise.resolve([]),
    ({entity, gmp}) => {
      const resources = [];
      const names = ['config', 'scanner', 'schedule'];

      for (const name of names) {
        if (hasValue(entity[name])) {
          resources.push(entity[name]);
        }
      }
      return Promise.resolve(resources);
    },
    ({entity, gmp}) => {
      if (hasValue(entity.target)) {
        return gmp.target.get(entity.target).then(response => {
          const target = response.data;
          const resources = [target];

          for (const name of ['port_list', ...TARGET_CREDENTIAL_NAMES]) {
            const cred = target[name];
            if (hasValue(cred)) {
              resources.push(cred);
            }
          }
          return resources;
        });
      }
      return Promise.resolve([]);
    },
  ],
})(EntityPermissions);

export default Page;

// vim: set ts=2 sw=2 tw=80:
