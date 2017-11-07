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

import _ from 'gmp/locale.js';

import {is_defined, parse_int} from 'gmp/utils.js';

import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
} from 'gmp/models/alert.js';

const Condition = ({
  condition,
  event,
}) => {
  if (condition.type === 'Filter count at least') {
    const count = parse_int(condition.data.count.value);
    let type;

    // FIXME this is not translateable
    if (event.type === EVENT_TYPE_NEW_SECINFO ||
      event.type === EVENT_TYPE_UPDATED_SECINFO) {
      type = 'NVT';
    }
    else {
      type = 'result';
    }

    if (count > 1) {
      type += 's';
    }
    return _('Filter matches at least {{count}} {{type}}', {count, type});
  }

  if (condition.type === 'Filter count changed') {
    const count = parse_int(condition.data.count.value);
    const direction = condition.data.direction.value === 'decreased' ?
      'fewer' : 'more';

    // FIXME this is not translateable
    return _('Filter matches at least {{count}} {{direction}} {{result}} ' +
      'then the previous scan', {
        count,
        direction,
        result: count > 0 ? 'results' : 'result',
      });
  }

  if (condition.type === 'Severity at least' &&
    is_defined(condition.data.severity)) {
    return _('Severity at least {{severity}}',
      {severity: condition.data.severity.value});
  }

  if (condition.type === 'Severity changed') {
    if (is_defined(condition.data.direction)) {
      if (condition.data.direction.value === 'decreased') {
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
