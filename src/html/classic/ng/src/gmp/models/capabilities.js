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

import {is_defined, for_each} from '../../utils.js';

import Model from '../model.js';

export class Capabilities extends Model {

  constructor(element) {
    super(element);

    if (!is_defined(this._capabilities)) {
      this._capabilities = {};
    }
  }

  get(name) {
    name = name.toUpperCase();
    let capability = this._capabilities[name];
    return is_defined(capability) ? capability : {};
  }

  mayAccess(type) {
    return this.mayOp('get_' + type);
  }

  mayOp(value) {
    return value.toUpperCase() in this._capabilities;
  }

  mayClone(type) {
    return this.mayOp('create_' + type);
  }

  mayEdit(type) {
    return this.mayOp('modify_' + type);
  }

  mayDelete(type) {
    return this.mayOp('delete_' + type);
  }

  mayCreate(type) {
    return this.mayOp('create_' + type);
  }

  setProperties() {};

  parseProroperties(elem) {
    let capabilities = {};

    for_each(elem, command => {
      capabilities[command.name.toUpperCase()] = {
        name: command.name,
        summary: command.summary,
      };
    });

    return capabilities;
  }

  updateFromElement(elem) {
    this._capabilities = this.parseProroperties(elem);
  }
}

export default Capabilities;

// vim: set ts=2 sw=2 tw=80:
