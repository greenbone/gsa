/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import _, {interval, long_date} from 'gmp/locale.js';

export const render_period = ({period, period_months}) => {
  if (period === 0 && period_months === 0) {
    return _('Once');
  }
  if (period === 0 && period_months === 1) {
    return _('One month');
  }
  if (period === 0) {
    return _('{{number}} months', {number: period_months});
  }
  return interval(period);
};

export const render_duration = duration => {
  if (duration === 0) {
    return _('Entire Operation');
  }
  return interval(duration);
};

export const render_next_time = next_time => next_time === 'over' ?
    '-' : long_date(next_time);

// vim: set ts=2 sw=2 tw=80:
