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

import {is_defined, is_object, for_each, map} from '../utils.js';

import {parse_yesno, YES_VALUE} from '../parser.js';

import Model from '../model.js';

const create_values = data => {
  const values = {value: data.__text};
  const {__text, name, ...other} = data;

  for (const key of Object.keys(other)) {
    const obj = data[key];
    if (is_defined(obj._id)) {
      obj.id = obj._id;
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
