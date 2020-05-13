/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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
import React, {useEffect, useState} from 'react';
import {isDefined} from 'gmp/utils/identity';

import _ from 'gmp/locale';

import CollectionCounts from 'gmp/collection/collectioncounts';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import Task from 'gmp/models/task';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tasks';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import TaskIcon from 'web/components/icon/taskicon';
import WizardIcon from 'web/components/icon/wizardicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import NewIconMenu from './icons/newiconmenu';

import TaskComponent from './component';
import TaskDashboard, {TASK_DASHBOARD_ID} from './dashboard';
import TaskFilterDialog from './filterdialog';
import Table from './table';
import {
  useGetTasks,
  useDeleteTask,
  useCloneTask,
  useStartTask,
  useStopTask,
} from './graphql';
import {queryWithRefetch} from 'web/utils/graphql';
import useCapabilities from 'web/utils/useCapabilities';

const DEFAULT_POLLING_INTERVAL = 10000;
const DEFAULT_POLLING_INTERVAL_ACTIVE = 2000;

export const ToolBarIcons = withCapabilities(
  ({
    onAdvancedTaskWizardClick,
    onModifyTaskWizardClick,
    onContainerTaskCreateClick,
    onTaskCreateClick,
    onTaskWizardClick,
  }) => {
    const capabilities = useCapabilities();

    return (
      <IconDivider>
        <ManualIcon
          page="scanning"
          anchor="managing-tasks"
          title={_('Help: Tasks')}
        />
        {capabilities.mayOp('run_wizard') && (
          <IconMenu icon={<WizardIcon />} onClick={onTaskWizardClick}>
            {capabilities.mayCreate('task') && (
              <MenuEntry title={_('Task Wizard')} onClick={onTaskWizardClick} />
            )}
            {capabilities.mayCreate('task') && (
              <MenuEntry
                title={_('Advanced Task Wizard')}
                onClick={onAdvancedTaskWizardClick}
              />
            )}
            {capabilities.mayEdit('task') && (
              <MenuEntry
                title={_('Modify Task Wizard')}
                onClick={onModifyTaskWizardClick}
              />
            )}
          </IconMenu>
        )}

        <NewIconMenu
          onNewClick={onTaskCreateClick}
          onNewContainerClick={onContainerTaskCreateClick}
        />
      </IconDivider>
    );
  },
);

ToolBarIcons.propTypes = {
  onAdvancedTaskWizardClick: PropTypes.func.isRequired,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onModifyTaskWizardClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskWizardClick: PropTypes.func.isRequired,
};

const Page = ({
  filter,
  onFilterChanged,
  onInteraction,
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  const query = useGetTasks();

  const [interval, setInterval] = useState(USE_DEFAULT_RELOAD_INTERVAL);

  const {data, refetch, error} = query({filterString: filter.toFilterString()})(
    {
      fetchPolicy: 'cache-and-network',
      pollInterval: interval,
    },
  );
  // query(vars)(options)
  const deleteTask = queryWithRefetch(useDeleteTask())(refetch);
  const cloneTask = queryWithRefetch(useCloneTask())(refetch);
  const startTask = queryWithRefetch(useStartTask())(refetch);
  const stopTask = queryWithRefetch(useStopTask())(refetch);

  let entities = [];
  let entitiesCounts;

  if (isDefined(data)) {
    entities = data.tasks.edges.map(entity => Task.fromObject(entity.node));

    const {total, filtered, offset, limit, length} = data.tasks.counts;
    entitiesCounts = new CollectionCounts({
      all: total,
      filtered: filtered,
      first: offset + 1,
      length: length,
      rows: limit,
    });
  }

  let entitiesError;

  if (isDefined(error)) {
    entitiesError = error;
  }

  useEffect(() => {
    setInterval(
      entities.some(task => task.isActive())
        ? DEFAULT_POLLING_INTERVAL_ACTIVE
        : DEFAULT_POLLING_INTERVAL,
    );
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TaskComponent
      onAdvancedTaskWizardSaved={onChanged}
      onCloned={refetch}
      onCloneError={onError}
      onContainerSaved={refetch}
      onCreated={refetch}
      onContainerCreated={refetch}
      onDeleted={refetch}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={onInteraction}
      onModifyTaskWizardSaved={onChanged}
      onReportImported={onChanged}
      onResumed={onChanged}
      onResumeError={onError}
      onSaved={refetch}
      onStarted={refetch}
      onStartError={onError}
      onStopped={refetch}
      onStopError={onError}
      onTaskWizardSaved={onChanged}
    >
      {({
        create,
        createcontainer,
        download,
        edit,
        start,
        stop,
        resume,
        reportimport,
        advancedtaskwizard,
        modifytaskwizard,
        taskwizard,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Tasks')} />
          <EntitiesPage
            {...props}
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            dashboard={() => (
              <TaskDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
                onInteraction={onInteraction}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={TASK_DASHBOARD_ID}
                onInteraction={onInteraction}
              />
            )}
            filter={filter}
            filterEditDialog={TaskFilterDialog}
            filtersFilter={TASKS_FILTER_FILTER}
            refetch={refetch}
            sectionIcon={<TaskIcon size="large" />}
            table={Table}
            title={_('Tasks')}
            toolBarIcons={ToolBarIcons}
            onAdvancedTaskWizardClick={advancedtaskwizard}
            onContainerTaskCreateClick={createcontainer}
            onError={onError}
            onFilterChanged={onFilterChanged}
            onInteraction={onInteraction}
            onModifyTaskWizardClick={modifytaskwizard}
            onReportImportClick={reportimport}
            onTaskCloneClick={cloneTask}
            onTaskCreateClick={create}
            onTaskDeleteClick={deleteTask}
            onTaskDownloadClick={download}
            onTaskEditClick={edit}
            onTaskResumeClick={resume}
            onTaskStartClick={startTask}
            onTaskStopClick={stopTask}
            onTaskWizardClick={taskwizard}
          />
        </React.Fragment>
      )}
    </TaskComponent>
  );
};

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export const taskReloadInterval = ({entities = []}) =>
  entities.some(task => task.isActive())
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;

export default withEntitiesContainer('task', {
  entitiesSelector,
  loadEntities,
  reloadInterval: taskReloadInterval,
})(Page);

// vim: set ts=2 sw=2 tw=80:
