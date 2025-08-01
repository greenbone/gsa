/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ical from 'ical.js';
import {v4 as uuid} from 'uuid';
import Logger from 'gmp/log';
import date, {
  duration as createDuration,
  Date,
  Duration,
} from 'gmp/models/date';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

type RecurrenceFrequencyType = keyof typeof RecurrenceFrequency;

type WeekDayValue = boolean | number;

interface WeekDaysOptions {
  monday?: WeekDayValue;
  tuesday?: WeekDayValue;
  wednesday?: WeekDayValue;
  thursday?: WeekDayValue;
  friday?: WeekDayValue;
  saturday?: WeekDayValue;
  sunday?: WeekDayValue;
}

type WeekDay = keyof WeekDaysOptions;

const log = Logger.getLogger('gmp.models.event');

const convertIcalDate = (iDate: ical.Time, timezone?: string) => {
  if (isDefined(timezone)) {
    if (iDate.zone === ical.Timezone.localTimezone) {
      // assume timezone hasn't been set and date wasn't supposed to use floating and therefore local timezone
      return date.tz(iDate.toString(), timezone);
    }
    return date.unix(iDate.toUnixTime()).tz(timezone);
  }
  return date.unix(iDate.toUnixTime());
};

const setEventDuration = (event: ical.Event, duration: ical.Duration) => {
  // setting the duration of an event directly isn't possible in
  // ical 1.2.2 yet. Therefore add same logic from ical master here
  if (event.component.hasProperty('dtend')) {
    event.component.removeProperty('dtend');
  }

  event._setProp('duration', duration);
};

const setEventRecurrence = (event: ical.Event, recurrence: ical.Recur) => {
  event._setProp('rrule', recurrence);
};

const PROD_ID = '-//Greenbone.net//NONSGML Greenbone Security Assistant';
const ICAL_VERSION = '2.0';

export const RecurrenceFrequency = {
  YEARLY: 'YEARLY',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
  DAILY: 'DAILY',
  HOURLY: 'HOURLY',
  MINUTELY: 'MINUTELY',
  SECONDLY: 'SECONDLY',
} as const;

const ISO_WEEKDAY_TO_WEEKDAY: Record<number, WeekDay> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday',
} as const;

const ABR_TO_WEEKDAY: Record<string, WeekDay> = {
  mo: 'monday',
  tu: 'tuesday',
  we: 'wednesday',
  th: 'thursday',
  fr: 'friday',
  sa: 'saturday',
  su: 'sunday',
} as const;

const getWeekDaysFromRRule = (recurrenceRule?: ical.Recur) => {
  if (!isDefined(recurrenceRule)) {
    return undefined;
  }

  const byday = recurrenceRule.getComponent('byday') as string[];
  return byday.length > 0 ? WeekDays.fromByDay(byday) : undefined;
};

const getMonthDaysFromRRule = (recurrenceRule?: ical.Recur) => {
  if (!isDefined(recurrenceRule)) {
    return undefined;
  }

  const bymonthday = recurrenceRule.getComponent('bymonthday') as number[];
  return bymonthday.length > 0 ? bymonthday.sort((a, b) => a - b) : undefined;
};

export class WeekDays {
  private readonly _weekdays: WeekDaysOptions;

  constructor({
    monday = false,
    tuesday = false,
    wednesday = false,
    thursday = false,
    friday = false,
    saturday = false,
    sunday = false,
  }: WeekDaysOptions = {}) {
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

  static fromByDay(byDate: string[] = []) {
    const weekdays = new WeekDays();

    for (const part of byDate) {
      const parsedDay = part.slice(-2).toLowerCase();
      const parsedValue = part.slice(0, -2);

      const weekDay = ABR_TO_WEEKDAY[parsedDay];
      const value = parsedValue.length === 0 ? true : parseInt(parsedValue);

      if (isDefined(weekDay) && isDefined(value)) {
        weekdays._setWeekDay(weekDay, value);
      }
    }

    return weekdays;
  }

  _setWeekDay(weekday: WeekDay, value: WeekDayValue = true) {
    this._weekdays[weekday] = value;
    return this;
  }

  isDefault() {
    return !this.values().some(value => value);
  }

  copy() {
    return new WeekDays({...this._weekdays});
  }

  entries(): Array<[string, WeekDayValue]> {
    return Object.entries(this._weekdays);
  }

  values(): WeekDayValue[] {
    return Object.values(this._weekdays);
  }

  getSelectedWeekDay() {
    const ret = this.entries().find(([, value]) => value);
    return isDefined(ret) ? ret[0] : undefined;
  }

  get(weekday: WeekDay) {
    return this._weekdays[weekday];
  }

  setWeekDay(weekday: WeekDay, value: WeekDayValue = true) {
    const copy = this.copy();
    return copy._setWeekDay(weekday, value);
  }

  setWeekDayFromDate(currentDate: Date, value: WeekDayValue = true) {
    const weekDay = ISO_WEEKDAY_TO_WEEKDAY[currentDate.isoWeekday()];
    return this.setWeekDay(weekDay, value);
  }

  toByDate() {
    const byday: string[] = [];

    for (const [abbr, weekday] of Object.entries(ABR_TO_WEEKDAY)) {
      const value = this.get(weekday);
      if (value) {
        if (value === true) {
          byday.push(abbr.toUpperCase());
        } else {
          byday.push(`${value}${abbr.toUpperCase()}`);
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
  readonly event: ical.Event;
  readonly timezone?: string;

  constructor(icalEvent: ical.Event, timezone?: string) {
    this.event = icalEvent;
    this.timezone = timezone;
  }

  static fromIcal(icalendar: string, timezone?: string): Event {
    const jCal = ical.parse(icalendar);
    const comp = new ical.Component(jCal);
    const vevent = comp.getFirstSubcomponent('vevent');
    const event = new ical.Event(vevent as ical.Component);
    return new Event(event, timezone);
  }

  static fromData(
    {
      description,
      duration,
      freq,
      interval,
      monthDays = [],
      startDate,
      summary,
      weekDays,
      uid = uuid(),
    }: {
      description?: string;
      duration?: Duration;
      freq?: RecurrenceFrequencyType;
      interval?: number;
      monthDays?: number[];
      startDate: Date;
      summary?: string;
      weekDays?: WeekDays;
      uid?: string;
    },
    timezone: string,
  ) {
    const event = new ical.Event();

    event.uid = uid;
    event.startDate = ical.Time.fromJSDate(startDate.toDate(), true);

    if (isDefined(duration)) {
      const eventDuration = new ical.Duration({
        days: duration.days(),
        weeks: duration.weeks(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      });
      setEventDuration(event, eventDuration);
    }

    if (isDefined(freq)) {
      const eventRecur = new ical.Recur({});

      eventRecur.freq = freq;
      eventRecur.interval = interval as number;

      const icalWeekDays = isDefined(weekDays) ? weekDays.toByDate() : [];

      if (icalWeekDays.length > 0) {
        eventRecur.setComponent('byday', icalWeekDays);
      }

      if (monthDays.length > 0) {
        eventRecur.setComponent('bymonthday', monthDays);
      }

      setEventRecurrence(event, eventRecur);
    }

    if (!isEmpty(summary)) {
      event.summary = summary as string;
    }

    if (!isEmpty(description)) {
      event.description = description as string;
    }

    return new Event(event, timezone);
  }

  _getRecurrenceRule(): ical.Recur | undefined {
    if (this.isRecurring()) {
      const recurrenceRule = this.event.component.getFirstPropertyValue(
        'rrule',
      ) as ical.Recur | null;
      return recurrenceRule === null ? undefined : recurrenceRule;
    }
    return undefined;
  }

  get startDate(): Date {
    return convertIcalDate(this.event.startDate, this.timezone);
  }

  get duration(): Duration {
    const {days, hours, minutes, weeks, seconds} = this.event.duration;
    return createDuration({
      days,
      hours,
      minutes,
      weeks,
      seconds,
    });
  }

  get durationInSeconds() {
    const {
      days = 0,
      hours = 0,
      minutes = 0,
      weeks = 0,
      seconds = 0,
    } = this.event.duration;
    return (
      seconds +
      minutes * 60 +
      hours * 60 * 60 +
      days * 24 * 60 * 60 +
      weeks * 7 * 24 * 60 * 60
    );
  }

  get recurrence() {
    const recurrenceRule = this._getRecurrenceRule();

    return {
      count: recurrenceRule?.count ?? undefined,
      freq: (recurrenceRule?.freq as RecurrenceFrequencyType) ?? undefined,
      interval: recurrenceRule?.interval ?? undefined,
      monthdays: getMonthDaysFromRRule(recurrenceRule),
      until: recurrenceRule?.until ?? undefined,
      weekdays: getWeekDaysFromRRule(recurrenceRule),
      wkst: recurrenceRule?.wkst ?? undefined,
    };
  }

  get nextDate() {
    if (this.isRecurring()) {
      const now = date();
      const it = this.event.iterator();

      let retries = 0;
      while (retries <= 5) {
        try {
          const next = it.next();
          if (convertIcalDate(next, this.timezone).unix() >= now.unix()) {
            return convertIcalDate(next, this.timezone);
          }
          retries = 0;
        } catch (err) {
          // ical raises an exception if the same date occurs twice
          // See https://github.com/mozilla-comm/ical/blob/master/lib/ical/recur_iterator#L373
          // But this may be valid e.g. when last day of month and the 31 of a
          // month are set in the rrule. Therefore ignore error and retry to get
          // a new date. Fail after 5 unsuccessful attempts
          retries++;
          if (retries >= 5) {
            log.error(
              'Error raised while calculating next date.',
              'ical event was:\n' + this.event + '\n',
              err,
            );
          }
        }
      }
    } else if (isDefined(this.event) && isDefined(this.event.startDate)) {
      // the event is not recurring
      // it should only occur once on its start date
      const now = date();
      const start = convertIcalDate(this.event.startDate, this.timezone);

      if (start.unix() >= now.unix()) {
        return start;
      }
    }
    return undefined;
  }

  get summary(): string | undefined {
    return this.event.summary !== null ? this.event.summary : undefined;
  }

  get description(): string | undefined {
    return this.event.description !== null ? this.event.description : undefined;
  }

  getNextDates(until: Date) {
    if (this.isRecurring()) {
      const now = date();
      const it = this.event.iterator();
      const dates: Date[] = [];

      while (true) {
        const next = it.next();

        if (it.complete || !next) {
          return dates;
        }

        const nextDate = convertIcalDate(next, this.timezone);

        if (nextDate.isAfter(until)) {
          return dates;
        }

        if (nextDate.isSameOrAfter(now)) {
          dates.push(nextDate);
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

export const isEvent = (obj: unknown): obj is Event => {
  return (
    obj instanceof Event ||
    (obj !== null &&
      isDefined(obj) &&
      isDefined(obj['event']) &&
      isDefined(obj['timezone']))
  );
};
export default Event;
