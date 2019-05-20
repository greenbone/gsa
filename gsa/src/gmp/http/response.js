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
class Response {
  constructor(xhr, data, meta = {}) {
    this._xhr = xhr;
    this._data = data;
    this._meta = meta;
  }

  set(data, meta) {
    return new Response(this._xhr, data, {...this._meta, ...meta});
  }

  setMeta(meta) {
    return new Response(this._xhr, this._data, {...this._meta, ...meta});
  }

  setData(data) {
    return new Response(this._xhr, data, this._meta);
  }

  plainData(type = '') {
    if (type === 'xml') {
      return this._xhr.responseXML;
    }
    if (type === 'text') {
      return this._xhr.responseText;
    }
    return this._xhr.response;
  }

  get meta() {
    return this._meta;
  }

  get data() {
    return this._data;
  }
}

export default Response;

// vim: set ts=2 sw=2 tw=80:
