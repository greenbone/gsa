/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import Model, {parseModelFromElement} from 'gmp/model';

import {parseYesNo, YES_VALUE} from 'gmp/parser';

import {forEach, map} from 'gmp/utils/array';
import {hasValue, isDefined, isObject} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Task from './task';
import Filter from './filter';

export const EVENT_TYPE_UPDATED_SECINFO = 'Updated SecInfo arrived';
export const EVENT_TYPE_NEW_SECINFO = 'New SecInfo arrived';
export const EVENT_TYPE_TASK_RUN_STATUS_CHANGED = 'Task run status changed';
export const EVENT_TYPE_TICKET_RECEIVED = 'Ticket received';
export const EVENT_TYPE_ASSIGNED_TICKET_CHANGED = 'Assigned ticket changed';
export const EVENT_TYPE_OWNED_TICKET_CHANGED = 'Owned ticket changed';

export const CONDITION_TYPE_FILTER_COUNT_AT_LEAST = 'Filter count at least';
export const CONDITION_TYPE_FILTER_COUNT_CHANGED = 'Filter count changed';
export const CONDITION_TYPE_SEVERITY_AT_LEAST = 'Severity at least';
export const CONDITION_TYPE_ALWAYS = 'Always';
export const CONDITION_TYPE_SEVERITY_CHANGED = 'Severity changed';

export const CONDITION_DIRECTION_DECREASED = 'decreased';
export const CONDITION_DIRECTION_INCREASED = 'increased';
export const CONDITION_DIRECTION_CHANGED = 'changed';

export const METHOD_TYPE_ALEMBA_VFIRE = 'Alemba vFire';
export const METHOD_TYPE_SCP = 'SCP';
export const METHOD_TYPE_SEND = 'Send';
export const METHOD_TYPE_SMB = 'SMB';
export const METHOD_TYPE_SNMP = 'SNMP';
export const METHOD_TYPE_SYSLOG = 'Syslog';
export const METHOD_TYPE_EMAIL = 'Email';
export const METHOD_TYPE_START_TASK = 'Start Task';
export const METHOD_TYPE_HTTP_GET = 'HTTP Get';
export const METHOD_TYPE_SOURCEFIRE = 'Sourcefire Connector';
export const METHOD_TYPE_VERINICE = 'verinice Connector';
export const METHOD_TYPE_TIPPING_POINT = 'TippingPoint SMS';

export const EMAIL_NOTICE_INCLUDE = '0';
export const EMAIL_NOTICE_SIMPLE = '1';
export const EMAIL_NOTICE_ATTACH = '2';

export const DELTA_TYPE_NONE = 'None';
export const DELTA_TYPE_PREVIOUS = 'Previous';
export const DELTA_TYPE_REPORT = 'Report';

export const isTaskEvent = event =>
  event === EVENT_TYPE_TASK_RUN_STATUS_CHANGED;
export const isTicketEvent = event =>
  event === EVENT_TYPE_ASSIGNED_TICKET_CHANGED ||
  event === EVENT_TYPE_OWNED_TICKET_CHANGED ||
  event === EVENT_TYPE_TICKET_RECEIVED;
export const isSecinfoEvent = event =>
  event === EVENT_TYPE_NEW_SECINFO || event === EVENT_TYPE_UPDATED_SECINFO;

const create_values = data => {
  const value = isEmpty(data.__text) ? undefined : data.__text;
  const values = {value};
  const {__text, name, ...other} = data;

  for (const [key, obj] of Object.entries(other)) {
    if (isDefined(obj._id)) {
      if (obj._id.length > 0) {
        obj.id = obj._id;
      }
      delete obj._id;
    }
    values[key] = obj;
  }

  return values;
};

class Alert extends Model {
  static entityType = 'alert';

  static parseObject(object) {
    const ret = super.parseObject(object);

    const types = ['condition', 'method', 'event'];

    for (const type of types) {
      if (isObject(ret[type])) {
        const data = {};

        forEach(ret[type].data, value => {
          data[value.name] = {value: value.value};
        });

        ret[type] = {
          type: ret[type].type,
          data,
        };
      } else {
        ret[type] = {
          type: ret[type],
          data: {},
        };
      }
    }

    if (hasValue(object.tasks)) {
      ret.tasks = map(object.tasks, task => Task.fromObject(task));
    } else {
      ret.tasks = [];
    }

    if (hasValue(object.filter)) {
      ret.filter = Filter.fromObject(object.filter);
    }

    const methDatRepForm = ret.method.data.report_formats;

    if (hasValue(methDatRepForm)) {
      const methDatRepFormSplit = methDatRepForm.value.split(',');
      ret.method.data.report_formats = methDatRepFormSplit.map(rf => rf.trim());
    } else {
      ret.method.data.report_formats = [];
    }

    return ret;
  }

  static parseElement(element) {
    const ret = super.parseElement(element);

    const types = ['condition', 'method', 'event'];

    for (const type of types) {
      if (isObject(ret[type])) {
        const data = {};

        forEach(ret[type].data, value => {
          data[value.name] = create_values(value);
        });

        ret[type] = {
          type: ret[type].__text,
          data,
        };
      } else {
        ret[type] = {
          type: ret[type],
          data: {},
        };
      }
    }

    if (isDefined(ret.filter)) {
      ret.filter = parseModelFromElement(ret.filter, 'filter');
    }

    if (isDefined(element.tasks)) {
      ret.tasks = map(element.tasks.task, task =>
        parseModelFromElement(task, 'task'),
      );
    } else {
      ret.tasks = [];
    }

    const methDatRepForm = ret.method.data.report_formats;

    if (isDefined(methDatRepForm) && isDefined(methDatRepForm.value)) {
      const methDatRepFormSplit = methDatRepForm.value.split(',');
      ret.method.data.report_formats = methDatRepFormSplit.map(rf => rf.trim());
    } else {
      ret.method.data.report_formats = [];
    }

    if (isDefined(ret.method.data.notice?.value)) {
      ret.method.data.notice.value = ret.method.data.notice.value.toString();
    }

    ret.active = parseYesNo(element.active);

    return ret;
  }

  isActive() {
    return this.active === YES_VALUE;
  }
}

export default Alert;

// vim: set ts=2 sw=2 tw=80:
