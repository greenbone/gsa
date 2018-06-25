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
import {is_empty} from '../utils/string';

import Model from '../model.js';

class Permission extends Model {

  static entity_type = 'permission';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (is_defined(elem.resource) && !is_empty(elem.resource._id)) {
      ret.resource = new Model(elem.resource, elem.resource.type);
    }
    else {
      delete ret.resource;
    }

    if (is_defined(elem.subject) && !is_empty(elem.subject._id)) {
      ret.subject = new Model(elem.subject, elem.subject.type);
    }
    else {
      delete ret.subject;
    }
    return ret;
  }
}

export default Permission;

// vim: set ts=2 sw=2 tw=80:
