/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
  CONDITION_TYPE_FILTER_COUNT_AT_LEAST,
  CONDITION_TYPE_FILTER_COUNT_CHANGED,
  CONDITION_TYPE_SEVERITY_AT_LEAST,
  CONDITION_DIRECTION_DECREASED,
} from 'gmp/models/alert';

const Condition = ({condition, event}) => {
  if (condition.type === CONDITION_TYPE_FILTER_COUNT_AT_LEAST) {
    const count = parseInt(condition.data.count.value);
    let type;

    // FIXME this is not translateable
    if (
      event.type === EVENT_TYPE_NEW_SECINFO ||
      event.type === EVENT_TYPE_UPDATED_SECINFO
    ) {
      type = 'NVT';
    } else {
      type = 'result';
    }

    if (count > 1) {
      type += 's';
    }
    return _('Filter matches at least {{count}} {{type}}', {count, type});
  }

  if (condition.type === CONDITION_TYPE_FILTER_COUNT_CHANGED) {
    const count = parseInt(condition.data.count.value);

    // FIXME this is not translateable
    return _(
      'Filter matches at least {{count}} more {{result}} ' +
        'than the previous scan',
      {
        count,
        result: count > 0 ? 'results' : 'result',
      },
    );
  }

  if (
    condition.type === CONDITION_TYPE_SEVERITY_AT_LEAST &&
    isDefined(condition.data.severity)
  ) {
    return _('Severity at least {{severity}}', {
      severity: condition.data.severity.value,
    });
  }

  if (condition.type === 'Severity changed') {
    if (isDefined(condition.data.direction)) {
      if (condition.data.direction.value === CONDITION_DIRECTION_DECREASED) {
        return _('Severity level decreased');
      }
      return _('Severity level increased');
    }
    return _('Severity level changed');
  }
  return condition.type;
};

export default Condition;

// vim: set ts=2 sw=2 tw=80:
