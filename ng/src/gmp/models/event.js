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
import 'core-js/fn/object/entries';

import ical from 'ical.js';

import uuid from 'uuid/v4';

import {is_defined} from '../utils/identity';
import {is_empty} from '../utils/string';

import date, {duration as createDuration} from './date';

const convertIcalDate = (idate, timezone) => is_defined(timezone) ?
  date.unix(idate.toUnixTime()).tz(timezone) :
  date.unix(idate.toUnixTime());

const setEventDuration = (event, duration) => {
  // setting the duration of an event directly isn't possible in
  // ical.js 1.2.2 yet. Therefore add same logic from ical.js master here
  if (event.component.hasProperty('dtend')) {
    event.component.removeProperty('dtend');
  }

  event._setProp('duration', duration);
};

const setEventRecurrence = (event, recurrence) => {
  event._setProp('rrule', recurrence);
};

const PROD_ID = '-//Greenbone.net//NONSGML Greenbone Security Assistent';
const ICAL_VERSION = '2.0';

const DAYS = 'day';
const WEEKS = 'week';
const MONTHS = 'month';

export const ReccurenceFrequency = {
  YEARLY: 'YEARLY',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
  DAILY: 'DAILY',
  HOURLY: 'HOURLY',
  MINUTELY: 'MINUTELY',
  SECONDLY: 'SECONDLY',
};

const ISOWEEKDAY_TO_WEEKDAY = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday',
};

const ABR_TO_WEEKDAY = {
  mo: 'monday',
  tu: 'tuesday',
  we: 'wednesday',
  th: 'thursday',
  fr: 'friday',
  sa: 'saturday',
  su: 'sunday',
};

export class WeekDays {

  constructor({
    monday = false,
    tuesday = false,
    wednesday = false,
    thursday = false,
    friday = false,
    saturday = false,
    sunday = false,
  } = {}) {
    this.monday = monday;
    this.tuesday = tuesday;
    this.wednesday = wednesday;
    this.thursday = thursday;
    this.friday = friday;
    this.saturday = saturday;
    this.sunday = sunday;
  }

  static fromByDay(bydate = []) {
    const weekdays = new WeekDays();

    for (const part of bydate) {
      const pday = part.slice(-2).toLowerCase();
      const pval = part.slice(0, -2);

      const wday = ABR_TO_WEEKDAY[pday];
      const val = pval.length === 0 ? true : pval;

      if (is_defined(wday)) {
        weekdays._setWeekDay(wday, val);
      }
    }

    return weekdays;
  }

  _setWeekDay(weekday, value = true) {
    this[weekday] = value;
    return this;
  }

  isDefault() {
    return this.monday === false && this.tuesday === false &&
      this.wednesday === false && this.thursday === false &&
      this.friday === false && this.saturday === false &&
      this.sunday === false;
  }

  copy() {
    return new WeekDays({...this});
  }

  setWeekDay(weekday, value = true) {
    const copy = this.copy();
    return copy._setWeekDay(weekday, value);
  }

  setWeekDayFromDate(curdate, value = true) {
    const wday = ISOWEEKDAY_TO_WEEKDAY[curdate.isoWeekday()];
    return this.setWeekDay(wday, value);
  }

  toByDate() {
    const byday = [];

    for (const [abbr, weekday] of Object.entries(ABR_TO_WEEKDAY)) {
      const value = this[weekday];
      if (value) {
        if (value === true) {
          byday.push(abbr.toUpperCase());
        }
        else {
          byday.push('' + value + abbr.toUpperCase());
        }
      }
    }

    return byday;
  }
}

class Event {

  constructor(icalevent, timezone) {
    this.event = icalevent;
    this.timezone = timezone;
  }

  static fromIcal(icalendar, timezone) {
    const jcal = ical.parse(icalendar);
    const comp = new ical.Component(jcal);
    const vevent = comp.getFirstSubcomponent('vevent');
    const event = new ical.Event(vevent);
    return new Event(event, timezone);
  }

  static fromData({
    description,
    startDate,
    duration,
    period = 0,
    periodUnit,
    summary,
  }, timezone) {

    const event = new ical.Event();

    event.uid = uuid();
    event.startDate = ical.Time.fromJSDate(startDate.toDate(), true);

    if (is_defined(duration)) {
      const eventDuration = new ical.Duration();

      eventDuration.days = duration.days();
      eventDuration.weeks = duration.weeks();
      eventDuration.hours = duration.hours();
      eventDuration.minutes = duration.minutes();
      eventDuration.seconds = duration.seconds();

      setEventDuration(event, eventDuration);
    }

    if (period > 0) {
      const eventRecur = new ical.Recur();
      if (periodUnit === MONTHS) {
        eventRecur.freq = ReccurenceFrequency.MONTHLY;
      }
      else if (periodUnit === WEEKS) {
        eventRecur.freq = ReccurenceFrequency.WEEKLY;
      }
      else if (periodUnit === DAYS) {
        eventRecur.freq = ReccurenceFrequency.WEEKLY;
      }
      else {
        eventRecur.freq = ReccurenceFrequency.HOURLY;
      }
      eventRecur.interval = period;

      setEventRecurrence(event, eventRecur);
    }

    if (!is_empty(summary)) {
      event.summary = summary;
    }
    if (!is_empty(description)) {
      event.description = description;
    }

    return new Event(event, timezone);
  }

  get startDate() {
    return convertIcalDate(this.event.startDate, this.timezone);
  }

  get duration() {
    return createDuration({...this.event.duration});
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
      const now = date();
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

  toIcalString() {
    const comp = new ical.Component(['vcalendar', [], []]);
    comp.addPropertyWithValue('prodid', PROD_ID);
    comp.addPropertyWithValue('version', ICAL_VERSION);

    const {component: vevent} = this.event;
    comp.addSubcomponent(vevent);
    return comp.toString();
  }
}

export default Event;

// vim: set ts=2 sw=2 tw=80:
