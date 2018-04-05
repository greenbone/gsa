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
import loader from '../../../components/dashboard2/data/loader';

export const TASKS_STATUS = 'tasks-status';
export const TASKS_SEVERITY = 'tasks-severity';
export const TASKS_SCHEDULES = 'tasks-schedules';

export const tasksStatusLoader = loader(TASKS_STATUS,
  ({gmp}) => gmp.tasks.getStatusAggregates().then(r => r.data));

export const tasksSeverityLoader = loader(TASKS_SEVERITY,
  ({gmp}) => gmp.tasks.getSeverityAggregates().then(r => r.data));

export const tasksSchedulesLoader = loader(TASKS_SCHEDULES,
  ({gmp}) => gmp.tasks.getAll({
    ignore_pagination: 1,
    no_filter_history: 1,
    schedules_only: 1,
  }).then(r => r.data));

// vim: set ts=2 sw=2 tw=80:
