/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {_localeData} from 'gmp/models/date';
import {RecurrenceFrequency} from 'gmp/models/event';
import {isDefined} from 'gmp/utils/identity';

const WEEKDAY = {
  monday: _l('Monday'),
  tuesday: _l('Tuesday'),
  wednesday: _l('Wednesday'),
  thursday: _l('Thursday'),
  friday: _l('Friday'),
  saturday: _l('Saturday'),
  sunday: _l('Sunday'),
};

export const renderRecurrence = ({
  freq,
  interval = 1,
  weekdays,
  monthdays,
} = {}) => {
  switch (freq) {
    case RecurrenceFrequency.YEARLY:
      if (interval === 1) {
        return _('Every year');
      }
      return _('Every {{interval}} years', {interval});

    case RecurrenceFrequency.MONTHLY:
      if (isDefined(monthdays)) {
        if (interval === 1) {
          return _('Every month at days {{days}}', {
            days: monthdays.join(', '),
          });
        }
        return _('Every {{interval}} month at days {{days}}', {
          interval,
          days: monthdays.join(', '),
        });
      } else if (isDefined(weekdays)) {
        const weekday = weekdays.getSelectedWeekDay();
        let nth = weekdays.get(weekday);
        const localeData = _localeData();
        if (nth === '-1') {
          nth = _('The last');
          if (interval === 1) {
            return _('The last {{weekday}} every month', {
              weekday: WEEKDAY[weekday],
            });
          }
          return _('The last {{weekday}} every {{interval}} months', {
            weekday: WEEKDAY[weekday],
            interval,
          });
        }
        if (interval === 1) {
          return _('{{nth}} {{weekday}} every month', {
            nth: localeData.ordinal(nth),
            weekday: WEEKDAY[weekday],
          });
        }
        return _('{{nth}} {{weekday}} every {{interval}} months', {
          nth: localeData.ordinal(nth),
          weekday: WEEKDAY[weekday],
          interval,
        });
      } else if (interval === 1) {
        return _('Every month');
      }
      return _('Every {{interval}} months', {interval});

    case RecurrenceFrequency.WEEKLY:
      if (isDefined(weekdays)) {
        const days = weekdays
          .entries()
          .filter(([, value]) => value)
          .map(([day]) => WEEKDAY[day]);

        if (interval === 1) {
          return _('Every week on {{days}}', {days: days.join(', ')});
        }
        return _('Every {{interval}} weeks on {{days}}', {
          interval,
          days: days.join(', '),
        });
      }
      if (interval === 1) {
        return _('Every week');
      }
      return _('Every {{interval}} weeks', {interval});

    case RecurrenceFrequency.DAILY:
      if (interval === 1) {
        return _('Every day');
      }
      return _('Every {{interval}} days', {interval});

    case RecurrenceFrequency.HOURLY:
      if (interval === 1) {
        return _('Every hour');
      }
      return _('Every {{interval}} hours', {interval});

    case RecurrenceFrequency.MINUTELY:
      if (interval === 1) {
        return _('Every minute');
      }
      return _('Every {{interval}} minutes', {interval});

    case RecurrenceFrequency.SECONDLY:
      if (interval === 1) {
        return _('Every second');
      }
      return _('Every {{interval}} seconds', {interval});

    default:
      return _('Once');
  }
};

export const renderDuration = duration => {
  return isDefined(duration) && duration.asSeconds() > 0
    ? duration.humanize()
    : _('Entire Operation');
};
