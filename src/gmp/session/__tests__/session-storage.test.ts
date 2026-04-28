/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  type default as SessionStorage,
  setSessionValue,
} from 'gmp/session/session-storage';

const createStorage = (state?: Record<string, string>): SessionStorage => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] ?? null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};

describe('setSessionValue tests', () => {
  test('should set value if it is defined', () => {
    const storage = createStorage();
    setSessionValue(storage, 'testKey', 'testValue');

    expect(storage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  test('should remove value if it is undefined', () => {
    const storage = createStorage({testKey: 'testValue'});
    setSessionValue(storage, 'testKey', undefined);

    expect(storage.removeItem).toHaveBeenCalledWith('testKey');
    expect(storage.setItem).not.toHaveBeenCalledWith('testKey', 'testValue');
    expect(storage.getItem('testKey')).toBeNull();
  });
});
