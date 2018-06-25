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

import {is_defined} from '../utils/identity';

import Model from '../model.js';

class Info extends Model {

  static info_type = 'unknown';
  static entity_type = 'info';

  constructor(elem, info_type) {
    super(elem);

    if (!is_defined(this.info_type)) { // only overwrite if not already set
      this.info_type = is_defined(info_type) ? info_type :
        this.constructor.info_type;
    }
  }

  parseProperties(elem, info_type) {
    const info_elem = elem[info_type];

    if (is_defined(info_elem)) { // elem is an info element content is in its child
      elem = {
        ...elem,
        ...info_elem,
      };

      delete elem[info_type];
    }

    return super.parseProperties(elem);
  }
}

export default Info;

// vim: set ts=2 sw=2 tw=80:
