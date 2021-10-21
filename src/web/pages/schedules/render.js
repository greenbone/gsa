/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import {_localeData} from 'gmp/models/date';
import {ReccurenceFrequency} from 'gmp/models/event';

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
    case ReccurenceFrequency.YEARLY:
      if (interval === 1) {
        return _('Every year');
      }
      return _('Every {{interval}} years', {interval});

    case ReccurenceFrequency.MONTHLY:
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

    case ReccurenceFrequency.WEEKLY:
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
  return isDefined(duration) && duration.asSeconds() > 0
    ? duration.humanize()
    : _('Entire Operation');
};

// vim: set ts=2 sw=2 tw=80:
