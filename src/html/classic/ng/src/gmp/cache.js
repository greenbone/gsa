/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined} from '../utils.js';

/**
 * Simple cache implementation
 *
 * Should be improved to a lru cache with a maximum of entries
 */

class Entry {

  constructor(value) {
    this.dirty = false;
    this.value = value;
  }

  invalidate() {
    this.dirty = true;
  }
}

export class Cache {

  constructor() {
    this.clear();
  }

  get(key) {
    return this._cache[key];
  }

  set(key, value) {
    this._cache[key] = value;
    return this;
  }

  has(key) {
    return key in this._cache;
  }

  clear() {
    this._cache = {};
  }

export class CacheFactory {

  constructor() {
    this._caches = {};
  }

  clearAll() {
    for (const key in this._caches) {
      const cache = this._caches[key];
      cache.clear();
    }
  }

  get(name) {
    if (name in this._caches) {
      return this._caches[name];
    }

    const cache = new Cache();
    this._caches[name] = cache;
    return cache;
  }
}

export default Cache;

// vim: set ts=2 sw=2 tw=80:
