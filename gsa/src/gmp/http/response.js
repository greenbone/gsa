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
