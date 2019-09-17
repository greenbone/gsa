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
import {isEmpty} from '../utils/string';

import Model, {parseModelFromElement} from '../model';

class Permission extends Model {
  static entityType = 'permission';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(element.resource) && !isEmpty(element.resource._id)) {
      ret.resource = parseModelFromElement(
        element.resource,
        element.resource.type,
      );
    } else {
      delete ret.resource;
    }

    if (isDefined(element.subject) && !isEmpty(element.subject._id)) {
      ret.subject = parseModelFromElement(
        element.subject,
        element.subject.type,
      );
    } else {
      delete ret.subject;
    }
    return ret;
  }
}

export default Permission;

// vim: set ts=2 sw=2 tw=80:
