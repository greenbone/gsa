/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type Meta = Record<string, unknown>;

/**
 * Represents a generic HTTP response wrapper that encapsulates the response data,
 * metadata, and the underlying XMLHttpRequest object.
 *
 * The class is immutable, meaning that once an instance is created, its properties
 * cannot be changed. Instead, methods like `set`, `setMeta`, and `setData` return
 * new instances with the updated values.
 *
 * @template TData - The type of the response data.
 * @template TMeta - The type of the response metadata, extending the `Meta` type.
 */
class Response<TData = unknown, TMeta extends Meta = Meta> {
  _xhr: XMLHttpRequest;
  _data: TData;
  _meta: TMeta;

  constructor(xhr: XMLHttpRequest, data: TData, meta: TMeta = {} as TMeta) {
    this._xhr = xhr;
    this._data = data;
    this._meta = meta;
  }

  set<TSetData = TData, TSetMeta extends Meta = TMeta>(
    data: TSetData,
    meta?: TSetMeta,
  ) {
    return new Response<TSetData, TSetMeta>(this._xhr, data, {
      ...this._meta,
      ...meta,
    } as TSetMeta);
  }

  setMeta<TSetMeta extends Meta = TMeta>(meta: TSetMeta) {
    return new Response<TData, TSetMeta>(this._xhr, this._data, {
      ...this._meta,
      ...meta,
    });
  }

  setData<TSetData = TData>(data: TSetData) {
    return new Response<TSetData, TMeta>(this._xhr, data, this._meta);
  }

  plainData(type?: 'xml' | 'text' | undefined): string | Document | null {
    if (type === 'xml') {
      return this._xhr.responseXML;
    }
    if (type === 'text') {
      return this._xhr.responseText;
    }
    return this._xhr.response;
  }

  get meta(): TMeta {
    return this._meta;
  }

  get data(): TData {
    return this._data;
  }
}

export default Response;
