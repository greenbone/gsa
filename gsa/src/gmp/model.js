/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
import {isDefined} from './utils/identity';
import {isEmpty} from './utils/string';
import {map} from './utils/array';

import {
  parseProperties,
  parseYesNo,
  parseDate,
  parseBoolean,
  setProperties,
  NO_VALUE,
  YES_VALUE,
} from './parser.js';

import Capabilities from './capabilities/capabilities.js';

class Model {
  static entityType = 'unknown';

  constructor(element, type) {
    this.init();

    this.entityType = isDefined(type) ? type : this.constructor.entityType;

    if (element) {
      this.updateFromElement(element);
    }
  }

  init() {}

  setProperties(properties) {
    return setProperties(properties, this);
  }

  updateFromElement(elem) {
    if (isDefined(elem)) {
      const properties = this.parseProperties(elem);
      this.setProperties(properties);
    }
    return this;
  }

  parseProperties(elem) {
    const copy = parseProperties(elem);

    if (isDefined(elem.end_time)) {
      if (elem.end_time.length > 0) {
        copy.endTime = parseDate(elem.end_time);
      }
      delete copy.end_time;
    }

    if (isDefined(elem.permissions)) {
      // these are the permissions the current user has on the entity
      const caps = map(elem.permissions.permission, perm => perm.name);
      copy.userCapabilities = new Capabilities(caps);
      delete copy.permissions;
    } else {
      copy.userCapabilities = new Capabilities();
    }

    if (isDefined(elem.user_tags)) {
      copy.userTags = map(elem.user_tags.tag, tag => {
        return new Model(tag, 'tag');
      });
      delete copy.user_tags;
    } else {
      copy.userTags = [];
    }

    const yes_no_props = ['writable', 'orphan', 'active', 'trash'];

    for (const name of yes_no_props) {
      const prop = elem[name];
      if (isDefined(prop)) {
        copy[name] = parseYesNo(prop);
      }
    }

    if (isDefined(elem.in_use)) {
      copy.inUse = parseBoolean(elem.in_use);
      delete copy.in_use;
    }

    if (isDefined(elem.owner) && isEmpty(elem.owner.name)) {
      delete copy.owner;
    }

    if (isEmpty(elem.comment)) {
      delete copy.comment;
    }

    return copy;
  }

  isInUse() {
    return this.inUse === true;
  }

  isInTrash() {
    return this.trash === YES_VALUE;
  }

  isWritable() {
    return this.writable !== NO_VALUE;
  }

  isOrphan() {
    return this.orphan === YES_VALUE;
  }

  isActive() {
    return this.active !== NO_VALUE;
  }
}

export default Model;

// vim: set ts=2 sw=2 tw=80:
