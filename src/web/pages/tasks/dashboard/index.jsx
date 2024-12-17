/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';


import {TasksCvssDisplay, TasksCvssTableDisplay} from './cvssdisplay';
import {
  TasksHighResultsDisplay,
  TasksHighResultsTableDisplay,
} from './highresults';
import {
  TasksMostHighResultsDisplay,
  TasksMostHighResultsTableDisplay,
} from './mosthighresults';
import {
  TasksSchedulesDisplay,
  TasksSchedulesTableDisplay,
} from './schedulesdisplay';
import {
  TasksSeverityDisplay,
  TasksSeverityTableDisplay,
} from './severityclassdisplay';
import {TasksStatusDisplay, TasksStatusTableDisplay} from './statusdisplay';
import Dashboard from '../../../components/dashboard/dashboard';

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

// vim: set ts=2 sw=2 tw=80:
