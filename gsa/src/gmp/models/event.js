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
import 'core-js/fn/object/values';

import ical from 'ical.js';

import uuid from 'uuid/v4';

import Logger from 'gmp/log';

import {is_defined} from '../utils/identity';
import {is_empty} from '../utils/string';

import date, {duration as createDuration} from './date';

const log = Logger.getLogger('gmp.models.event');

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

const getWeekDaysFromRRule = rrule => {
    if (!is_defined(rrule)) {
      return undefined;
    }

    const byday = rrule.getComponent('byday');
    return byday.length > 0 ? WeekDays.fromByDay(byday) : undefined;
};

const getMonthDaysFromRRule = rrule => {
  if (!is_defined(rrule)) {
    return undefined;
  }

  const bymonthday = rrule.getComponent('bymonthday');
  return bymonthday.length > 0 ? bymonthday.sort() : undefined;
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
    this._weekdays = {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    };
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
    this._weekdays[weekday] = value;
    return this;
  }

  isDefault() {
    return !this.values().some(value => value);
  }

  copy() {
    return new WeekDays({...this._weekdays});
  }

  entries() {
    return Object.entries(this._weekdays);
  }

  values() {
    return Object.values(this._weekdays);
  }

  getSelectedWeekDay() {
    const ret = this.entries().find(([, value]) => value);
    return is_defined(ret) ? ret[0] : undefined;
  }

  get(weekday) {
    return this._weekdays[weekday];
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
      const value = this.get(weekday);
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

  get monday() {
    return this.get('monday');
  }

  get tuesday() {
    return this.get('tuesday');
  }

  get wednesday() {
    return this.get('wednesday');
  }

  get thursday() {
    return this.get('thursday');
  }

  get friday() {
    return this.get('friday');
  }

  get saturday() {
    return this.get('saturday');
  }

  get sunday() {
    return this.get('sunday');
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
    duration,
    freq,
    interval,
    monthdays = [],
    startDate,
    summary,
    weekdays,
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

    if (is_defined(freq)) {
      const eventRecur = new ical.Recur();

      eventRecur.freq = freq;
      eventRecur.interval = interval;

      const icalweekdays = is_defined(weekdays) ? weekdays.toByDate() : [];

      if (icalweekdays.length > 0) {
        eventRecur.setComponent('byday', icalweekdays);
      }

      if (monthdays.length > 0) {
        eventRecur.setComponent('bymonthday', monthdays);
      }

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

  _getReccurenceRule() {
    if (this.isRecurring()) {
      const rrule = this.event.component.getFirstPropertyValue('rrule');
      return rrule === null ? undefined : rrule;
    }
    return undefined;
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
    const rrule = this._getReccurenceRule();

    return {
      ...rrule,
      weekdays: getWeekDaysFromRRule(rrule),
      monthdays: getMonthDaysFromRRule(rrule),
    };
  }

  get nextDate() {
    if (this.isRecurring()) {
      const now = ical.Time.now();
      const it = this.event.iterator();

      let retries = 0;
      while (true && retries <= 5) {
        try {
          const next = it.next();
          if (next.compare(now) >= 0) {
            return convertIcalDate(next, this.timezone);
          }
          retries = 0;
        }
        catch (err) {
          // ical.js raises an exception if the same date occurs twice
          // See https://github.com/mozilla-comm/ical.js/blob/master/lib/ical/recur_iterator.js#L373
          // But this may be valid e.g. when last day of month and the 31 of a
          // month are set in the rrule. Therefore ignore error and retry to get
          // a new date. Fail after 5 unsuccessful attemps
          retries++;
          log.error(err);
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
