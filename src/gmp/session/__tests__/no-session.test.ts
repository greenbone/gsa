/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import NoSession from 'gmp/session/no-session';

const createStorage = (state?: Record<string, string>) => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] ?? null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};

describe('NoSession tests', () => {
  test('should create a session', () => {
    const storage = createStorage();
    const session = new NoSession(storage);

    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();
  });

  test('should return locale and timezone from storage', () => {
    const storage = createStorage({
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59Z',
    });
    const session = new NoSession(storage);

    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.username).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
  });

  test('should not store session data except for locale and timezone', () => {
    const storage = createStorage();
    const session = new NoSession(storage);

    session.token = 'test-token';
    session.sessionTimeout = date('2024-12-31T23:59:59Z');
    session.locale = 'en-US';
    session.timezone = 'UTC';
    session.username = 'test-user';

    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBeUndefined();

    expect(storage.setItem).not.toHaveBeenCalledWith('token', 'test-token');
    expect(storage.setItem).not.toHaveBeenCalledWith(
      'sessionTimeout',
      '2024-12-31T23:59:59.000Z',
    );
    expect(storage.setItem).not.toHaveBeenCalledWith('username', 'test-user');
    expect(storage.setItem).toHaveBeenCalledWith('locale', 'en-US');
    expect(storage.setItem).toHaveBeenCalledWith('timezone', 'UTC');

    expect(storage.getItem).toHaveBeenCalledWith('locale');
    expect(storage.getItem).toHaveBeenCalledWith('timezone');
  });
});
