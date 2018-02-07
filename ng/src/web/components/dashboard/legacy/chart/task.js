
/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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
import 'core-js/fn/object/entries';

import {is_defined, map} from 'gmp/utils';

import {extract_filter_info_json} from '../helper.js';

import BaseChartGenerator from './base.js';

/**
 * Extracts schedule records from tasks
 *
 * @param {Object} data  The response object
 *
 * @return  An array of records as used by chart generators.
 */
const extract_task_records_json = data => {
  return map(data.task, task => {

    const record = {
      id: task._id,
      name: task.name,
    };

    if (is_defined(task.schedule)) {
      record.schedule_id = task.schedule._id;
    }

    for (const [name, value] of Object.entries(task.schedule)) {
      if (name[0] === '_') { // skip former xml attributes
        continue;
      }
      record['schedule_' + name] = value;
    }

    if (is_defined(task.schedule_periods)) {
      record.schedule_periods = task.schedule_periods;
    }

    return record;
  });
};

/**
 * Prepares column info for get_tasks.
 *
 * @return  A column_info object as used by chart generators.
 */
const tasks_column_info = () => {
  return {
    columns: {
      id: {
        name: 'id',
        stat: 'value',
        type: 'task',
        column: 'id',
        data_type: 'uuid',
      },
      name: {
        name: 'name',
        stat: 'value',
        type: 'task',
        column: 'name',
        data_type: 'text',
      },
      schedule_id: {
        name: 'schedule_id',
        stat: 'value',
        type: 'task',
        column: 'schedule_id',
        data_type: 'uuid',
      },
      schedule_name: {
        name: 'schedule_name',
        stat: 'value',
        type: 'task',
        column: 'schedule_name',
        data_type: 'text',
      },
      schedule_next_time: {
        name: 'schedule_next_time',
        stat: 'value',
        type: 'task',
        column: 'schedule_next_time',
        data_type: 'iso_time',
      },
      schedule_trash: {
        name: 'schedule_trash',
        stat: 'value',
        type: 'task',
        column: 'schedule_trash',
        data_type: 'integer',
      },
      schedule_first_time: {
        name: 'schedule_first_time',
        stat: 'value',
        type: 'task',
        column: 'schedule_first_time',
        data_type: 'iso_time',
      },
      schedule_period: {
        name: 'schedule_period',
        stat: 'value',
        type: 'task',
        column: 'schedule_period',
        data_type: 'integer',
      },
      schedule_period_months: {
        name: 'schedule_period_months',
        stat: 'value',
        type: 'task',
        column: 'schedule_period_months',
        data_type: 'integer',
      },
      schedule_duration: {
        name: 'schedule_duration',
        stat: 'value',
        type: 'task',
        column: 'schedule_duration',
        data_type: 'integer',
      },
      schedule_periods: {
        name: 'schedule_periods',
        stat: 'value',
        type: 'task',
        column: 'schedule_periods',
        data_type: 'integer',
      },
    },
  };
};

class TaskChartGenerator extends BaseChartGenerator {

  constructor(name) {
    super(name);
    this.command = 'get_tasks';
  }

  extractData(data, gen_params) {
    const response = data.get_tasks.get_tasks_response;
    const records = extract_task_records_json(response);
    return {
      records: records,
      column_info: tasks_column_info(),
      filter_info: extract_filter_info_json(response.filters),
    };
  }
}

export default TaskChartGenerator;

// vim: set ts=2 sw=2 tw=80:
