/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  TasksCvssDisplay,
  TasksCvssTableDisplay,
} from 'web/pages/tasks/dashboard/CvssDisplay';
import {
  TasksHighResultsDisplay,
  TasksHighResultsTableDisplay,
} from 'web/pages/tasks/dashboard/HighResults';
import {
  TasksMostHighResultsDisplay,
  TasksMostHighResultsTableDisplay,
} from 'web/pages/tasks/dashboard/MostHighResults';
import {
  TasksSchedulesDisplay,
  TasksSchedulesTableDisplay,
} from 'web/pages/tasks/dashboard/SchedulesDisplay';
import {
  TasksSeverityDisplay,
  TasksSeverityTableDisplay,
} from 'web/pages/tasks/dashboard/SeverityClassDisplay';
import {
  TasksStatusDisplay,
  TasksStatusTableDisplay,
} from 'web/pages/tasks/dashboard/StatusDisplay';

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

const TaskDashboard = props => (
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
