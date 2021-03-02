/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import React from 'react';

import Dashboard from 'web/components/dashboard/dashboard';

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
