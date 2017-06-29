/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import  _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import DataSource from '../../components/dashboard/datasource.js';
import Chart from '../../components/dashboard/chart.js';

const TaskCharts = ({filter}) => {
  return (
    <div>
      <DataSource name="task-severity-count-source"
        filter={filter}
        group-column="severity"
        aggregate-type="task">
        <Chart name="task-by-cvss"
          template="info_by_cvss"
          type="bar"
          title={_('Tasks by CVSS')}
          title-count="count"/>
        <Chart name="task-by-severity-class"
          type="donut"
          template="info_by_class"
          title={_('Tasks by Severity Class')}
          title-count="count"/>
      </DataSource>
      <DataSource name="task-status-count-source"
        filter={filter}
        group-column="status"
        aggregate-type="task">
        <Chart name="task-by-status"
          type="donut"
          title={_('Tasks by status')}
          title-count="count"/>
      </DataSource>
      <DataSource name="task-high-results-source"
        filter={filter}
        aggregate-type="task"
        group-column="uuid"
        columns={['severity', 'high_per_host']}
        text-columns={['name', 'modified']}
        sort-fields={['high_per_host', 'modified']}
        sort-orders={['descending', 'descending']}
        sort-stats={['max', 'value']}>
        <Chart name="task-by-high-results"
          type="bubbles"
          title={_('Tasks: High results per host')}
          x-field="name"
          y-fields={['high_per_host_max']}
          z-fields={['severity_max']}
          gen-params={{empty_text: 'No Tasks with High severity found'}}/>
        <Chart name="task-by-most-high-results"
          type="horizontal_bar"
          title={_('Tasks with most High results per host')}
          x-field="name"
          y-fields={['high_per_host_max']}
          z-fields={['severity_max']}
          gen-params={{empty_text: 'No Tasks with High severity found'}}/>
      </DataSource>
      <DataSource name="task-schedules-source"
        filter={filter}
        type="task">
        <Chart name="task-by-schedules"
          type="gantt"
          title={_('Next scheduled tasks')}
          gen-params={{empty_text: 'No scheduled Tasks found'}}/>
      </DataSource>
    </div>
  );
};

TaskCharts.propTypes = {
  filter: PropTypes.filter,
};

export default TaskCharts;

// vim: set ts=2 sw=2 tw=80:
