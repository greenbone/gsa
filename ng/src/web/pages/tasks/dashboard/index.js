/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import PropTypes from '../../../utils/proptypes';

import Dashboard from '../../../components/dashboard2/dashboard';

import {TasksStatusDisplay, TasksStatusTableDisplay} from './statusdisplay';
import {
  TasksSeverityDisplay,
  TasksSeverityTableDisplay,
} from './severityclassdisplay';
import {
  TasksSchedulesDisplay,
  TasksSchedulesTableDisplay,
} from './schedulesdisplay';
import {
  TasksCvssDisplay,
  TasksCvssTableDisplay,
 } from './cvssdisplay';
import {
  TasksMostHighResultsDisplay,
  TasksMostHighResultsTableDisplay,
} from './mosthighresults';
import {
  TasksHighResultsDisplay,
  TasksHighResultsTableDisplay,
} from './highresults';

export const TASK_DASHBOARD_ID = '3d5db3c7-5208-4b47-8c28-48efc621b1e0';

const TaskDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={TASK_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={[
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
    ]}
    defaultContent={[
      [
        TasksSeverityDisplay.displayId,
        TasksMostHighResultsDisplay.displayId,
        TasksStatusDisplay.displayId,
      ],
    ]}
    maxItemsPerRow={4}
    maxRows={4}
    onFilterChanged={onFilterChanged}
  />
);

TaskDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default TaskDashboard;

// vim: set ts=2 sw=2 tw=80:
