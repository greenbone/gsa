/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';

import {_localeData} from 'gmp/models/date';
import {ReccurenceFrequency} from 'gmp/models/event';

const WEEKDAY = {
  monday: _('Monday'),
  tuesday: _('Tuesday'),
  wednesday: _('Wednesday'),
  thursday: _('Thursday'),
  friday: _('Friday'),
  saturday: _('Saturday'),
  sunday: _('Sunday'),
};

export const renderRecurrence = ({
  freq,
  interval = 1,
  weekdays,
  monthdays,
} = {}) => {
  switch (freq) {
    case ReccurenceFrequency.YEARLY:
      if (interval === 1) {
        return _('Every year');
      }
      return _('Every {{interval}} years', {interval});

    case ReccurenceFrequency.MONTHLY:
      if (is_defined(monthdays)) {
        if (interval === 1) {
          return _('Every month at days {{days}}',
            {days: monthdays.join(', ')});
        }
        return _('Every {{interval}} month at days {{days}}',
          {interval, days: monthdays.join(', ')});
      }
      else if (is_defined(weekdays)) {
        const weekday = weekdays.getSelectedWeekDay();
        const nth = weekdays.get(weekday);
        const localeData = _localeData();
        if (interval === 1) {
          return _('{{nth}} {{weekday}} every month',
            {nth: localeData.ordinal(nth), weekday: WEEKDAY[weekday]});
        }
        return _('{{nth}} {{weekday}} every {{interval}} month', {
          nth: localeData.ordinal(nth),
          weekday: WEEKDAY[weekday],
          interval,
        });
      }
      else if (interval === 1) {
        return _('Every month');
      }
      return _('Every {{interval}} months', {interval});

    case ReccurenceFrequency.WEEKLY:
      if (is_defined(weekdays)) {
        const days = weekdays.entries()
          .filter(([, value]) => value)
          .map(([day]) => WEEKDAY[day]);

        if (interval === 1) {
          return _('Every week on {{days}}', {days: days.join(', ')});
        }
        return _('Every {{interval}} weeks on {{days}}',
          {interval, days: days.join(', ')});
      }
      if (interval === 1) {
        return _('Every week');
      }
      return _('Every {{interval}} weeks', {interval});

    case ReccurenceFrequency.DAILY:
      if (interval === 1) {
        return _('Every day');
      }
      return _('Every {{interval}} days', {interval});

    case ReccurenceFrequency.HOURLY:
      if (interval === 1) {
        return _('Every hour');
      }
      return _('Every {{interval}} hours', {interval});

    case ReccurenceFrequency.MINUTELY:
      if (interval === 1) {
        return _('Every minute');
      }
      return _('Every {{interval}} minutes', {interval});

    case ReccurenceFrequency.SECONDLY:
      if (interval === 1) {
        return _('Every second');
      }
      return _('Every {{interval}} seconds', {interval});

    default:
      return _('Once');
  }
};

export const renderDuration = duration => {
  return is_defined(duration) && duration.asSeconds() > 0 ?
    duration.humanize() :
    _('Entire Operation');
};

// vim: set ts=2 sw=2 tw=80:
