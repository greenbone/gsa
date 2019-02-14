/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {isDefined} from '../utils/identity';
import {map} from '../utils/array';

import Model from '../model';

import Event from './event';

class Schedule extends Model {
  static entityType = 'schedule';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    const {timezone, icalendar} = elem;

    if (isDefined(icalendar)) {
      ret.event = Event.fromIcal(icalendar, timezone);

      delete ret.icalendar;
    }

    // remove legacy schedule fields
    delete ret.first_time;
    delete ret.next_time;
    delete ret.duration;
    delete ret.period;
    delete ret.periods;
    delete ret.period_months;
    delete ret.simple_duration;
    delete ret.simple_period;

    if (isDefined(ret.tasks)) {
      ret.tasks = map(ret.tasks.task, task => new Model(task, 'task'));
    } else {
      ret.tasks = [];
    }

    return ret;
  }
}

export default Schedule;

// vim: set ts=2 sw=2 tw=80:
