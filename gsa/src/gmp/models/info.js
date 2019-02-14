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

import {isDefined} from '../utils/identity';

import Model from '../model.js';

class Info extends Model {
  static entityType = 'info';

  parseProperties(elem, infoType) {
    const info_elem = elem[infoType];

    if (isDefined(info_elem)) {
      // elem is an info element content is in its child
      elem = {
        ...elem,
        ...info_elem,
      };

      delete elem[infoType];
    }

    return super.parseProperties(elem);
  }
}

export default Info;

// vim: set ts=2 sw=2 tw=80:
