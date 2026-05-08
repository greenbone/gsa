/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import UserSessionState from 'gmp/session/user-session-state';
import {createStorage} from 'gmp/testing';

describe('UserSessionState tests', () => {
  test('should create a session state', () => {
    const storage = createStorage();

    const session = new UserSessionState(storage, {
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(session.isLoggedIn).toBe(true);

    expect(storage.getItem).not.toHaveBeenCalled();

    expect(session.jwt).toBe('test-jwt');
    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    expect(storage.setItem).toHaveBeenCalledWith('jwt', 'test-jwt');
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
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59.000Z',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });
    const session = new UserSessionState(storage);

    expect(session.jwt).toBe('test-jwt');
    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    expect(storage.getItem).toHaveBeenCalledWith('jwt');
    expect(storage.getItem).toHaveBeenCalledWith('token');
    expect(storage.getItem).toHaveBeenCalledWith('sessionTimeout');
    expect(storage.getItem).toHaveBeenCalledWith('locale');
    expect(storage.getItem).toHaveBeenCalledWith('timezone');
    expect(storage.getItem).toHaveBeenCalledWith('username');
  });

  test('should update session properties', () => {
    const storage = createStorage();

    const session = new UserSessionState(storage);

    session.jwt = 'test-jwt';
    session.token = 'test-token';
    session.locale = 'fr-FR';
    session.sessionTimeout = date('2025-01-01T00:00:00Z');
    session.timezone = 'CET';
    session.username = 'new-user';

    expect(session.jwt).toBe('test-jwt');
    expect(session.token).toBe('test-token');
    expect(session.locale).toBe('fr-FR');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(session.timezone).toBe('CET');
    expect(session.username).toBe('new-user');

    expect(storage.setItem).toHaveBeenCalledWith('jwt', 'test-jwt');
    expect(storage.setItem).toHaveBeenCalledWith('token', 'test-token');
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
      jwt: 'test-jwt',
      token: 'test-token',
      locale: 'en-US',
      sessionTimeout: '2024-12-31T23:59:59.000Z',
      timezone: 'UTC',
      username: 'test-user',
    });

    const session = new UserSessionState(storage);

    expect(session.jwt).toBe('test-jwt');
    expect(session.token).toBe('test-token');
    expect(session.locale).toBe('en-US');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    session.jwt = undefined;
    session.token = undefined;
    session.locale = undefined;
    session.sessionTimeout = undefined;
    session.timezone = undefined;
    session.username = undefined;

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.locale).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();

    expect(storage.removeItem).toHaveBeenCalledWith('jwt');
    expect(storage.removeItem).toHaveBeenCalledWith('token');
    expect(storage.removeItem).toHaveBeenCalledWith('locale');
    expect(storage.removeItem).toHaveBeenCalledWith('sessionTimeout');
    expect(storage.removeItem).toHaveBeenCalledWith('timezone');
    expect(storage.removeItem).toHaveBeenCalledWith('username');
  });

  test('should transition to NoSessionState on logout', () => {
    const storage = createStorage({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59.000Z',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    const session = new UserSessionState(storage);

    const newState = session.logout();

    expect(newState.jwt).toBeUndefined();
    expect(newState.token).toBeUndefined();
    expect(newState.sessionTimeout).toBeUndefined();
    expect(newState.locale).toBe('en-US');
    expect(newState.timezone).toBe('UTC');
    expect(newState.username).toBeUndefined();

    expect(storage.removeItem).toHaveBeenCalledWith('jwt');
    expect(storage.removeItem).toHaveBeenCalledWith('token');
    expect(storage.removeItem).toHaveBeenCalledWith('sessionTimeout');
    expect(storage.removeItem).toHaveBeenCalledWith('username');
    expect(storage.getItem).toHaveBeenCalledWith('locale');
    expect(storage.getItem).toHaveBeenCalledWith('timezone');
  });

  test('should override storage values with provided session properties', () => {
    const storage = createStorage({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59.000Z',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    const session = new UserSessionState(storage, {
      jwt: 'new-jwt',
      token: 'new-token',
      sessionTimeout: date('2025-01-01T00:00:00Z'),
      locale: 'fr-FR',
      timezone: 'CET',
      username: 'new-user',
    });

    expect(session.jwt).toBe('new-jwt');
    expect(session.token).toBe('new-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(session.locale).toBe('fr-FR');
    expect(session.timezone).toBe('CET');
    expect(session.username).toBe('new-user');
  });

  test('should remain in UserSessionState on login', () => {
    const storage = createStorage();

    const session = new UserSessionState(storage, {
      jwt: 'test-jwt',
      token: 'test-token1',
      sessionTimeout: date('2025-12-31T23:59:59Z'),
      locale: 'de-DE',
      timezone: 'CET',
      username: 'test-user1',
    });

    const newState = session.login({
      jwt: 'new-jwt',
      token: 'test-token2',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user2',
    });

    expect(newState).toBe(session);
    expect(newState.jwt).toBe('test-jwt');
    expect(newState.token).toBe('test-token1');
    expect(newState.sessionTimeout?.toISOString()).toBe(
      '2025-12-31T23:59:59.000Z',
    );
    expect(newState.locale).toBe('de-DE');
    expect(newState.timezone).toBe('CET');
    expect(newState.username).toBe('test-user1');
  });

  test("should return same session timeout instance if it's not changed", () => {
    const storage = createStorage({
      sessionTimeout: '2024-12-31T23:59:59.000Z',
    });

    const session = new UserSessionState(storage);

    const firstTimeout = session.sessionTimeout;
    const secondTimeout = session.sessionTimeout;

    expect(firstTimeout).toBe(secondTimeout);
  });

  test("should return new session timeout instance if it's changed", () => {
    const storage = createStorage({
      sessionTimeout: '2024-12-31T23:59:59.000Z',
    });

    const session = new UserSessionState(storage);

    const firstTimeout = session.sessionTimeout;

    session.sessionTimeout = date('2025-01-01T00:00:00Z');

    const secondTimeout = session.sessionTimeout;

    expect(firstTimeout).not.toBe(secondTimeout);
    expect(secondTimeout?.toISOString()).toBe('2025-01-01T00:00:00.000Z');

    session.sessionTimeout = undefined;

    expect(session.sessionTimeout).toBeUndefined();
  });
});
