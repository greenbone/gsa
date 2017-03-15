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

import moment from 'moment';

import {is_defined, is_empty, parse_int} from '../../utils.js';

import Model from '../model.js';

export class Schedule extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    ret.period = parse_int(ret.period);
    ret.period_months = parse_int(ret.period_months);
    ret.duration = parse_int(ret.duration);

    if (is_defined(ret.simple_duration)) {
      ret.simple_duration = {
        value: parse_int(ret.simple_duration.__text),
        unit: is_empty(ret.simple_duration.unit) ? undefined :
          ret.simple_duration.unit,
      };
    }
    else {
      ret.simple_duration = {
      };
    }

    if (is_defined(ret.simple_period)) {
      ret.simple_period = {
        value: parse_int(ret.simple_period.__text),
        unit: is_empty(ret.simple_period.unit) ? undefined :
          ret.simple_period.unit,
      };
    }
    else {
      ret.simple_period = {
      };
    }

    ret.first_time = moment(ret.first_time).tz(ret.timezone);
    ret.next_time = ret.next_time === 'over' ? ret.next_time :
      moment(ret.next_time).tz(ret.timezone);

    return ret;
  }
}

export default Schedule;

// vim: set ts=2 sw=2 tw=80:
