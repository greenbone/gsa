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

import CancelToken from '../cancel.js';

describe('CancelToken tests', () => {
  test('new CancelToken resolve', () => {
    const token = new CancelToken(cancel => {
      cancel('because of a test');
    });
    return expect(token.promise).resolves.toBe('because of a test');
  });

  test('CancelToken.source resolve', () => {
    const {token, cancel} = CancelToken.source();

    cancel('because of a test');

    return expect(token.promise).resolves.toBe('because of a test');
  });

  test('new CancelToken canceled', () => {
    const token = new CancelToken(cancel => {
      cancel('because of a test');
    });

    expect(token.canceled).toBe(true);
    expect(token.reason).toBe('because of a test');
  });

  test('new CancelToken not canceled', () => {
    const token = new CancelToken(() => {});

    expect(token.canceled).toBe(false);
    expect(token.reason).toBeUndefined();
  });

  test('CancelToken.source canceled', () => {
    const {token, cancel} = CancelToken.source();

    expect(token.reason).toBeUndefined();
    expect(token.canceled).toBe(false);

    cancel('because of a test');

    expect(token.reason).toBe('because of a test');
    expect(token.canceled).toBe(true);
  });

  test('CancelToken cancel twice', async () => {
    const {token, cancel} = CancelToken.source();

    cancel('because of a test');

    expect(token.reason).toBe('because of a test');
    expect(token.canceled).toBe(true);

    await expect(token.promise).resolves.toBe('because of a test');

    cancel('because of a second test');

    expect(token.reason).toBe('because of a second test');
    expect(token.canceled).toBe(true);

    await expect(token.promise).resolves.toBe('because of a test');
  });
});

// vim: set ts=2 sw=2 tw=80:
