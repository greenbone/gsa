/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import NoSessionState from 'gmp/session/no-session-state';
import {createStorage} from 'gmp/testing';

describe('NoSessionState tests', () => {
  test('should create a session state', () => {
    const storage = createStorage();
    const session = new NoSessionState(storage);

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();

    expect(session.isLoggedIn).toBe(false);
  });

  test('should return locale and timezone from storage', () => {
    const storage = createStorage({
      jwt: 'test-jwt',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59Z',
    });
    const session = new NoSessionState(storage);

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.username).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
  });

  test('should not update session data', () => {
    const storage = createStorage();
    const session = new NoSessionState(storage);

    session.jwt = 'test-jwt';
    session.token = 'test-token';
    session.sessionTimeout = date('2024-12-31T23:59:59Z');
    session.locale = 'en-US';
    session.timezone = 'UTC';
    session.username = 'test-user';

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();

    expect(storage.setItem).not.toHaveBeenCalledWith('jwt', 'test-jwt');
    expect(storage.setItem).not.toHaveBeenCalledWith('token', 'test-token');
    expect(storage.setItem).not.toHaveBeenCalledWith(
      'sessionTimeout',
      '2024-12-31T23:59:59.000Z',
    );
    expect(storage.setItem).not.toHaveBeenCalledWith('username', 'test-user');
    expect(storage.setItem).not.toHaveBeenCalledWith('locale', 'en-US');
    expect(storage.setItem).not.toHaveBeenCalledWith('timezone', 'UTC');

    expect(storage.getItem).toHaveBeenCalledWith('locale');
    expect(storage.getItem).toHaveBeenCalledWith('timezone');
  });

  test('should transition to UserSessionState on login', () => {
    const storage = createStorage();
    const session = new NoSessionState(storage);

    const newState = session.login({
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
      jwt: 'test-jwt',
    });

    expect(newState.token).toBe('test-token');
    expect(newState.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(newState.locale).toBe('en-US');
    expect(newState.timezone).toBe('UTC');
    expect(newState.username).toBe('test-user');
    expect(newState.jwt).toBe('test-jwt');
  });

  test('should remain in NoSessionState on logout', () => {
    const storage = createStorage();
    const session = new NoSessionState(storage);

    const newState = session.logout();

    expect(newState).toBe(session);
  });
});
