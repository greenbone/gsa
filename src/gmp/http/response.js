/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
