/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {is_defined, is_empty, is_object, for_each, map} from '../utils.js';

import {parse_yesno, YES_VALUE} from '../parser.js';

import Model from '../model.js';

export const EVENT_TYPE_UPDATED_SECINFO = 'Updated SecInfo arrived';
export const EVENT_TYPE_NEW_SECINFO = 'New SecInfo arrived';
export const EVENT_TYPE_TASK_RUN_STATUS_CHANGED = 'Task run status changed';

export const CONDITION_TYPE_FILTER_COUNT_AT_LEAST = 'Filter count at least';
export const CONDITION_TYPE_FILTER_COUNT_CHANGED = 'Filter count changed';
export const CONDITION_TYPE_SEVERITY_AT_LEAST = 'Severity at least';
export const CONDITION_TYPE_ALWAYS = 'Always';

export const CONDITION_DIRECTION_DECREASED = 'decreased';
export const CONDITION_DIRECTION_INCREASED = 'increased';
export const CONDITION_DIRECTION_CHANGED = 'changed';

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

export const EMAIL_NOTICE_INCLUDE = '0';
export const EMAIL_NOTICE_ATTACH = '2';

const create_values = data => {
  const value = is_empty(data.__text) ? undefined : data.__text;
  const values = {value};
  const {__text, name, ...other} = data;

  for (const [key, obj] of Object.entries(other)) {
    if (is_defined(obj._id)) {
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

  static entity_type = 'alert';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    const types = ['condition', 'method', 'event'];

    for (const type of types) {
      if (is_object(ret[type])) {
        const data = {};

        for_each(ret[type].data, value => {
          data[value.name] = create_values(value);
        });

        ret[type] = {
          type: ret[type].__text,
          data,
        };
      }
      else {
        ret[type] = {
          type: ret[type],
          data: {},
        };
      }
    }

    if (is_defined(ret.filter)) {
      ret.filter = new Model(ret.filter, 'filter');
    }

    if (is_defined(elem.tasks)) {
      ret.tasks = map(elem.tasks.task,
        task => new Model(task, 'task'));
    }
    else {
      ret.tasks = [];
    }

    ret.active = parse_yesno(elem.active);

    return ret;
  }

  isActive() {
    return this.active === YES_VALUE;
  }
}

export default Alert;

// vim: set ts=2 sw=2 tw=80:
