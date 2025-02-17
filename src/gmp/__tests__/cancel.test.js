/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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
