/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import moment from 'moment-timezone';

import ical from 'ical.js';

import {is_defined} from '../utils/identity';
import {map} from '../utils/array';

import Model from '../model.js';

const convertIcalDate = (date, timezone) => is_defined(timezone) ?
  moment.unix(date.toUnixTime()).tz(timezone) :
  moment.unix(date.toUnixTime());

export const ReccurenceFrequency = {
  YEARLY: 'YEARLY',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
  DAILY: 'DAILY',
  HOURLY: 'HOURLY',
  MINUTELY: 'MINUTELY',
  SECONDLY: 'SECONDLY',
};

class Event {

  constructor(icalendar, timezone) {
    const jcal = ical.parse(icalendar);
    const comp = new ical.Component(jcal);
    const vevent = comp.getFirstSubcomponent('vevent');
    this.event = new ical.Event(vevent);
    this.timezone = timezone;
  }

  get startDate() {
    return convertIcalDate(this.event.startDate, this.timezone);
  }

  get duration() {
    return this.event.duration;
  }

  get durationInSeconds() {
    const {
      days = 0,
      hours = 0,
      minutes = 0,
      weeks = 0,
      seconds = 0,
    } = this.event.duration;
    return seconds +
      minutes * 60 +
      hours * 60 * 60 +
      days * 24 * 60 * 60 +
      weeks * 7 * 24 * 60 * 60;
  }

  get recurrence() {
    if (this.isRecurring()) {
      const rrule = this.event.component.getFirstPropertyValue('rrule');
      return rrule === null ? undefined : rrule;
    }
    return undefined;
  }

  get nextDate() {
    if (this.isRecurring()) {
      const now = ical.Time.now();
      const it = this.event.iterator();

      while (true) {
        const next = it.next();
        if (next.compare(now) >= 0) {
          return convertIcalDate(next, this.timezone);
        }
      }
    }
    return undefined;
  }

  getNextDates(until) {
    if (this.isRecurring()) {
      const now = moment();
      const it = this.event.iterator();
      const dates = [];

      while (true) {
        const next = it.next();

        if (it.completed || !next) {
          return dates;
        }

        const mnext = convertIcalDate(next);

        if (mnext.isAfter(until)) {
          return dates;
        }

        if (mnext.isSameOrAfter(now)) {
          dates.push(mnext);
        }
      }
    }

    return [];
  }

  isRecurring() {
    return this.event.isRecurring();
  }
}

class Schedule extends Model {

  static entity_type = 'schedule';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    const {timezone, icalendar} = elem;

    if (is_defined(icalendar)) {
      ret.event = new Event(icalendar, timezone);

      delete ret.icalendar;
    }

    if (is_defined(ret.tasks)) {
      ret.tasks = map(ret.tasks.task, task => new Model(task, 'task'));
    }
    else {
      ret.tasks = [];
    }

    return ret;
  }
}

export default Schedule;

// vim: set ts=2 sw=2 tw=80:
