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

import CancelToken from '../cancel';

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
