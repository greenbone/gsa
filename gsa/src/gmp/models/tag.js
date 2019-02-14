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
import {normalizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {parseInt} from 'gmp/parser';

import Model from '../model';

class Tag extends Model {
  static entityType = 'tag';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (isDefined(elem.resources)) {
      ret.resourceType = normalizeType(elem.resources.type);
      ret.resourceCount = parseInt(elem.resources.count.total);
    } else {
      ret.resourceCount = 0;
    }
    ret.value = isEmpty(elem.value) ? undefined : elem.value;

    return ret;
  }
}

export default Tag;

// vim: set ts=2 sw=2 tw=80:
