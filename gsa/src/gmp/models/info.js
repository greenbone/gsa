/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import {isDefined} from '../utils/identity';

import Model from '../model.js';

class Info extends Model {
  static entityType = 'info';

  static parseElement(elem, infoType) {
    const info_elem = elem[infoType];

    if (isDefined(info_elem)) {
      // elem is an info element content is in its child
      elem = {
        ...elem,
        ...info_elem,
      };

      delete elem[infoType];
    }

    return super.parseElement(elem);
  }
}

export default Info;

// vim: set ts=2 sw=2 tw=80:
