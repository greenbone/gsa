/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {normalizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {parseInt} from 'gmp/parser';

import Model from 'gmp/model';

class Tag extends Model {
  static entityType = 'tag';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(element.resources)) {
      ret.resourceType = normalizeType(element.resources.type);
      ret.resourceCount = parseInt(element.resources.count.total);
    } else {
      ret.resourceCount = 0;
    }
    ret.value = isEmpty(element.value) ? undefined : element.value;

    return ret;
  }
}

export default Tag;

// vim: set ts=2 sw=2 tw=80:
