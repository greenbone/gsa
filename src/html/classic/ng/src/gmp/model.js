/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import moment from 'moment';

import {
  is_defined,
  map,
} from './utils.js';

import {
  parse_properties,
  parse_yesno,
  set_properties,
  NO_VALUE,
  YES_VALUE,
} from './parser.js';

import Capabilities from './capabilities.js';

class Model {

  static entity_type = 'unknown';

  constructor(element, type) {
    this.init();

    this.entity_type = is_defined(type) ? type : this.constructor.entity_type;

    if (element) {
      this.updateFromElement(element);
    }
  }

  init() {
  }

  setProperties(properties) {
    return set_properties(properties, this);
  }

  updateFromElement(elem) {
    if (is_defined(elem)) {
      let properties = this.parseProperties(elem);
      this.setProperties(properties);
    }
    return this;
  }

  parseProperties(elem) {
    const copy = parse_properties(elem);

    if (is_defined(elem.end_time)) {
      if (elem.end_time.length === 0) {
        delete copy.end_time;
      }
      else {
        copy.end_time = moment(elem.end_time);
      }
    }

    if (is_defined(elem.permissions)) {
      // these are the permissions the current user has on the entity
      copy.user_capabilities = new Capabilities(elem.permissions.permission);
      delete copy.permissions;
    }
    else {
      copy.user_capabilities = new Capabilities();
    }

    if (is_defined(elem.user_tags)) {
      copy.user_tags = map(elem.user_tags.tag, tag => {
        return new Model(tag, 'tag');
      });
    }

    const yes_no_props = ['in_use', 'writable', 'orphan', 'active', 'trash'];

    for (const name of yes_no_props) {
      const prop = elem[name];
      if (is_defined(prop)) {
        copy[name] = parse_yesno(prop);
      }
    }

    return copy;
  }

  isInUse() {
    return this.in_use === YES_VALUE;
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
