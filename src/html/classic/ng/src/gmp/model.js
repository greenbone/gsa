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

import {is_defined} from '../utils.js';

export class Model {

  constructor(element) {
    this.init();

    if (element) {
      this.updateFromElement(element);
    }
  }

  init() {
  }

  setProperties(properties) {
    if (is_defined(properties)) {
      for (let key in properties) {
        if (properties.hasOwnProperty(key) && !key.startsWith('_')) {
          this[key] = properties[key];
        }
      }
    }
    return this;
  }

  updateFromElement(elem) {
    if (is_defined(this.parseProperties)) {
      let properties = this.parseProperties(elem);
      this.setProperties(properties);
    }
    return this;
  }

  parseProperties(elem) {
    elem.id = elem._id;
    delete elem._id;
    return elem;
  }
}

export default Model;

// vim: set ts=2 sw=2 tw=80:
