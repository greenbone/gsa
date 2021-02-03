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
  CONDITION_DIRECTION_INCREASED,
} from 'gmp/models/alert';

const Condition = ({condition = {}, event}) => {
  if (!isDefined(condition.type) || !isDefined(condition.data)) {
    return null;
  }

  let count = _('undefined');

  if (condition.type === CONDITION_TYPE_FILTER_COUNT_AT_LEAST) {
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

    if (isDefined(condition.data.count)) {
      count = parseInt(condition.data.count.value);
      if (count > 1) {
        type += 's';
      }
    }
    return _('Filter matches at least {{count}} {{type}}', {count, type});
  }

  if (condition.type === CONDITION_TYPE_FILTER_COUNT_CHANGED) {
    if (isDefined(condition.data.count)) {
      count = parseInt(condition.data.count.value);
    }

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
    if (condition?.data?.direction?.value === CONDITION_DIRECTION_DECREASED) {
      return _('Severity level decreased');
    } else if (
      condition?.data?.direction?.value === CONDITION_DIRECTION_INCREASED
    ) {
      return _('Severity level increased');
    }
    return _('Severity level changed');
  }
  return condition.type;
};

export default Condition;

// vim: set ts=2 sw=2 tw=80:
