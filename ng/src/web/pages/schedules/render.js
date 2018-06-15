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

import {ReccurenceFrequency} from 'gmp/models/event';

export const renderRecurrence = ({freq, interval = 1} = {}) => {
  switch (freq) {
    case ReccurenceFrequency.YEARLY:
      if (interval === 1) {
        return _('One year');
      }
      return _('{{interval}} years', {interval});
    case ReccurenceFrequency.MONTHLY:
      if (interval === 1) {
        return _('One month');
      }
      return _('{{interval}} months', {interval});
    case ReccurenceFrequency.WEEKLY:
      if (interval === 1) {
        return _('One week');
      }
      return _('{{interval}} weeks', {interval});
    case ReccurenceFrequency.DAILY:
      if (interval === 1) {
        return _('One day');
      }
      return _('{{interval}} days', {interval});
    case ReccurenceFrequency.HOURLY:
      if (interval === 1) {
        return _('One hour');
      }
      return _('{{interval}} hours', {interval});
    case ReccurenceFrequency.MINUTELY:
      if (interval === 1) {
        return _('One minute');
      }
      return _('{{interval}} minutes', {interval});
    case ReccurenceFrequency.SECONDLY:
      if (interval === 1) {
        return _('One second');
      }
      return _('{{interval}} seconds', {interval});
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
