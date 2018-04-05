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

import {
  tasksStatusLoader,
  tasksSeverityLoader,
  tasksSchedulesLoader,
} from './loaders';

import TasksStatusDisplay from './statusdisplay';
import TasksSeverityDisplay from './severityclassdisplay';
import TasksSchedulesDisplay from './schedulesdisplay';

const TaskDashboard = ({
  filter,
}) => (
  <Dashboard
    loaders={[
      tasksStatusLoader,
      tasksSeverityLoader,
      tasksSchedulesLoader,
    ]}
    components={{
      'tasks-status': TasksStatusDisplay,
      'tasks-severity-class': TasksSeverityDisplay,
      'tasks-schedules': TasksSchedulesDisplay,
    }}
    defaultContent={[
      [
        'tasks-status',
        'tasks-severity-class',
      ],
      [
        'tasks-schedules',
      ],
    ]}
  />
);

TaskDashboard.propTypes = {
  filter: PropTypes.filter,
};

export default TaskDashboard;

// vim: set ts=2 sw=2 tw=80:
