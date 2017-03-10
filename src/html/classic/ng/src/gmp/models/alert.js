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

import {is_defined, is_object, for_each} from '../../utils.js';

import Model from '../model.js';


const create_values = data => {
  let values = {value: data.__text};
  let {__text, name, ...other} = data;

  for (let key of Object.keys(other)) {
    values[key] = data[key];
  }

  return values;
};

export class Alert extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    let types = ['condition', 'method', 'event'];

    for (let type of types) {
      if (is_object(ret[type])) {
        let data = {};

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
      ret.filter = new Model(ret.filter);
    }

    return ret;
  }
}

export default Alert;

// vim: set ts=2 sw=2 tw=80:
