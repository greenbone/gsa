/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {TasksStatusDisplay, TasksStatusTableDisplay} from './statusdisplay';
import {
  TasksSeverityDisplay,
  TasksSeverityTableDisplay,
} from './severityclassdisplay';
import {
  TasksSchedulesDisplay,
  TasksSchedulesTableDisplay,
} from './schedulesdisplay';
import {TasksCvssDisplay, TasksCvssTableDisplay} from './cvssdisplay';
import {
  TasksMostHighResultsDisplay,
  TasksMostHighResultsTableDisplay,
} from './mosthighresults';
import {
  TasksHighResultsDisplay,
  TasksHighResultsTableDisplay,
} from './highresults';

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
    id={TASK_DASHBOARD_ID}
    permittedDisplays={TASKS_DISPLAYS}
    defaultDisplays={[
      [
        TasksSeverityDisplay.displayId,
        TasksMostHighResultsDisplay.displayId,
        TasksStatusDisplay.displayId,
      ],
    ]}
  />
);

export default TaskDashboard;

// vim: set ts=2 sw=2 tw=80:
