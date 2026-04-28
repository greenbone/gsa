/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import UserSession from 'gmp/session/user-session';

const createStorage = (state?: Record<string, string>) => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] ?? null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};

describe('UserSession tests', () => {
  test('should create a session', () => {
    const storage = createStorage();

    const session = new UserSession(storage, {
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(storage.getItem).not.toHaveBeenCalled();

    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    expect(storage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(storage.setItem).toHaveBeenCalledWith(
      'sessionTimeout',
      '2024-12-31T23:59:59.000Z',
    );
    expect(storage.setItem).toHaveBeenCalledWith('locale', 'en-US');
    expect(storage.setItem).toHaveBeenCalledWith('timezone', 'UTC');
    expect(storage.setItem).toHaveBeenCalledWith('username', 'test-user');

    expect(storage.getItem).toHaveBeenCalledWith('token');
    expect(storage.getItem).toHaveBeenCalledWith('sessionTimeout');
    expect(storage.getItem).toHaveBeenCalledWith('locale');
    expect(storage.getItem).toHaveBeenCalledWith('timezone');
    expect(storage.getItem).toHaveBeenCalledWith('username');
  });

  test('should allow to get initial session properties from storage', () => {
    const storage = createStorage({
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59.000Z',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });
    const session = new UserSession(storage);

    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    expect(storage.getItem).toHaveBeenCalledWith('token');
    expect(storage.getItem).toHaveBeenCalledWith('sessionTimeout');
    expect(storage.getItem).toHaveBeenCalledWith('locale');
    expect(storage.getItem).toHaveBeenCalledWith('timezone');
    expect(storage.getItem).toHaveBeenCalledWith('username');
  });

  test('should update session properties', () => {
    const storage = createStorage();

    const session = new UserSession(storage);

    session.locale = 'fr-FR';
    session.sessionTimeout = date('2025-01-01T00:00:00Z');
    session.timezone = 'CET';
    session.username = 'new-user';

    expect(session.locale).toBe('fr-FR');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(session.timezone).toBe('CET');
    expect(session.username).toBe('new-user');

    expect(storage.setItem).toHaveBeenCalledWith('locale', 'fr-FR');
    expect(storage.setItem).toHaveBeenCalledWith(
      'sessionTimeout',
      '2025-01-01T00:00:00.000Z',
    );
    expect(storage.setItem).toHaveBeenCalledWith('timezone', 'CET');
    expect(storage.setItem).toHaveBeenCalledWith('username', 'new-user');
  });

  test('should remove session properties', () => {
    const storage = createStorage({
      locale: 'en-US',
      sessionTimeout: '2024-12-31T23:59:59.000Z',
      timezone: 'UTC',
      username: 'test-user',
    });

    const session = new UserSession(storage);

    session.locale = undefined;
    session.sessionTimeout = undefined;
    session.timezone = undefined;
    session.username = undefined;

    expect(session.locale).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();

    expect(storage.removeItem).toHaveBeenCalledWith('locale');
    expect(storage.removeItem).toHaveBeenCalledWith('sessionTimeout');
    expect(storage.removeItem).toHaveBeenCalledWith('timezone');
    expect(storage.removeItem).toHaveBeenCalledWith('username');
  });
});
