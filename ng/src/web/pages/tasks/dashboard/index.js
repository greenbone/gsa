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

import TasksStatusDisplay from './statusdisplay';
import TasksSeverityDisplay from './severityclassdisplay';
import TasksSchedulesDisplay from './schedulesdisplay';
import TasksCvssDisplay from './cvssdisplay';
import TasksMostHighResultsDisplay from './mosthighresults';
import TasksHighResultsDisplay from './highresults';

const TaskDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    filter={filter}
    id="3d5db3c7-5208-4b47-8c28-48efc621b1e0"
    components={{
      'task-by-status': TasksStatusDisplay,
      'task-by-severity-class': TasksSeverityDisplay,
      'task-by-schedules': TasksSchedulesDisplay,
      'task-by-cvss': TasksCvssDisplay,
      'task-by-most-high-results': TasksMostHighResultsDisplay,
      'task-by-high-results': TasksHighResultsDisplay,
    }}
    defaultContent={[
      [
        'task-by-severity-class',
        'task-by-most-high-results',
        'task-by-status',
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

TaskDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default TaskDashboard;

// vim: set ts=2 sw=2 tw=80:
