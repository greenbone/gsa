/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  TasksCvssDisplay,
  TasksCvssTableDisplay,
} from 'web/pages/tasks/dashboard/TaskCvssDisplay';
import {
  TasksHighResultsDisplay,
  TasksHighResultsTableDisplay,
} from 'web/pages/tasks/dashboard/TaskHighResultsDisplay';
import {
  TasksMostHighResultsDisplay,
  TasksMostHighResultsTableDisplay,
} from 'web/pages/tasks/dashboard/TaskMostHighResultsDisplay';
import {
  TasksSchedulesDisplay,
  TasksSchedulesTableDisplay,
} from 'web/pages/tasks/dashboard/TaskSchedulesDisplay';
import {
  TasksSeverityDisplay,
  TasksSeverityTableDisplay,
} from 'web/pages/tasks/dashboard/TaskSeverityClassDisplay';
import {
  TasksStatusDisplay,
  TasksStatusTableDisplay,
} from 'web/pages/tasks/dashboard/TaskStatusDisplay';

interface TaskDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const TASK_DASHBOARD_ID = '3d5db3c7-5208-4b47-8c28-48efc621b1e0';

export const TASKS_DISPLAYS = [
  TasksStatusDisplay.displayId,
  TasksSeverityDisplay.displayId,
  TasksSchedulesDisplay.displayId,
  TasksCvssDisplay.displayId,
  TasksMostHighResultsDisplay.displayId,
  TasksHighResultsDisplay.displayId,
  TasksSeverityTableDisplay.displayId,
  TasksCvssTableDisplay.displayId,
  TasksStatusTableDisplay.displayId,
  TasksSchedulesTableDisplay.displayId,
  TasksHighResultsTableDisplay.displayId,
  TasksMostHighResultsTableDisplay.displayId,
];

const TaskDashboard = (props: TaskDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        TasksSeverityDisplay.displayId,
        TasksMostHighResultsDisplay.displayId,
        TasksStatusDisplay.displayId,
      ],
    ]}
    id={TASK_DASHBOARD_ID}
    permittedDisplays={TASKS_DISPLAYS}
  />
);

export default TaskDashboard;
