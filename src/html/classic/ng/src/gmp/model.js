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

import {is_defined, extend, map} from './utils.js';

import Capabilities from './capabilities.js';

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
    if (is_defined(elem)) {
      let properties = this.parseProperties(elem);
      this.setProperties(properties);
    }
    return this;
  }

  parseProperties(elem) {
    let copy = extend({}, elem);
    copy.id = elem._id;

    if (is_defined(elem.creation_time)) {
      copy.creation_time = moment(elem.creation_time);
    }
    if (is_defined(elem.modification_time)) {
      copy.modification_time = moment(elem.modification_time);
    }
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
        return new Model(tag);
      });
    }

    return copy;
  }

  isInUse() {
    return this.in_use === '1';
  }

  isWriteable() {
    return this.writable !== '0';
  }

  isOrphan() {
    return this.orphan === '1';
  }

  isActive() {
    return this.active !== '0';
  }
}

export default Model;

// vim: set ts=2 sw=2 tw=80:
