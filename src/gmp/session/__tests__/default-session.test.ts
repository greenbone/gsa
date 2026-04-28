/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import DefaultSession from 'gmp/session/default-session';

const createStorage = (state?: Record<string, string>) => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] ?? null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};

describe('DefaultSession tests', () => {
  test('should create a default session', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();
  });

  test('should return locale and timezone from storage if available', () => {
    const storage = createStorage({
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59Z',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });
    const session = new DefaultSession(storage);

    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.username).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
  });

  test('should not update session data', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    session.setLocale('en-US');
    session.setTimezone('UTC');

    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
  });

  test('should login and logout correctly', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    session.login({
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    session.logout();

    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBeUndefined();
  });

  test('should allow to set locale and timezone after login', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    session.login({
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    session.setLocale('fr-FR');
    session.setTimezone('CET');

    expect(session.locale).toBe('fr-FR');
    expect(session.timezone).toBe('CET');
  });
});
