/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import {type default as SessionStorage} from 'gmp/session/session-storage';
import Settings from 'gmp/settings';
import useSession from 'web/hooks/useSession';
import {rendererWith} from 'web/testing/Render';

const createStorage = (state?: Record<string, string>): SessionStorage => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] ?? null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};

describe('useSession tests', () => {
  test('should return session data from storage', () => {
    const storage = createStorage({locale: 'de', timezone: 'CET'});
    const settings = new Settings(storage);
    const gmp = {
      settings,
    };
    const {renderHook} = rendererWith({
      gmp,
    });
    const {result} = renderHook(() => useSession());
    expect(result.current.locale).toBe('de');
    expect(result.current.timezone).toBe('CET');
  });

  test('should allow to login and logout', () => {
    const storage = createStorage();
    const settings = new Settings(storage);
    const gmp = {
      settings,
    };
    const {renderHook} = rendererWith({
      gmp,
    });
    const {result} = renderHook(() => useSession());
    expect(result.current.token).toBeUndefined();

    result.current.login({
      token: 'foo',
      locale: 'de',
      timezone: 'CET',
      username: 'testuser',
      sessionTimeout: date('2024-01-01T00:00:00Z'),
    });
    expect(result.current.token).toBe('foo');
    expect(result.current.locale).toBe('de');
    expect(result.current.timezone).toBe('CET');
    expect(result.current.username).toBe('testuser');
    expect(result.current.sessionTimeout).toEqual(date('2024-01-01T00:00:00Z'));

    result.current.logout();
    expect(result.current.token).toBeUndefined();
    expect(result.current.locale).toEqual('de'); // locale is still available from storage
    expect(result.current.timezone).toEqual('CET'); // timezone is still available from storage
    expect(result.current.username).toBeUndefined();
    expect(result.current.sessionTimeout).toBeUndefined();
  });
});
