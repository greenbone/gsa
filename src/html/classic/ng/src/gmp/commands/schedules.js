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

import logger from '../../log.js';

import {EntityCommand, register_command} from '../command.js';

import Schedule from '../models/schedule.js';

const log = logger.getLogger('gmp.commands.schedules');

export class ScheduleCommand extends EntityCommand {

  constructor(http) {
    super(http, 'schedule', Schedule);
  }

  create(args) {
    let {name, comment = '', hour, minute, timezone, date,
      period, period_unit, duration, duration_unit} = args;
    let day_of_month = date.day();
    let month = date.month();
    let year = date.year();
    log.debug('Creating new schedule', args);
    return this.httpPost({
      cmd: 'create_schedule',
      next: 'get_schedule',
      name,
      comment,
      day_of_month,
      month,
      year,
      hour,
      minute,
      timezone,
      period,
      period_unit,
      duration,
      duration_unit,
    }).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_schedule.get_schedules_response.schedule;
  }
}

register_command('schedule', ScheduleCommand);

// vim: set ts=2 sw=2 tw=80:
