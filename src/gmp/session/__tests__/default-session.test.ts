/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, onTestFinished} from '@gsa/testing';
import date from 'gmp/models/date';
import DefaultSession from 'gmp/session/default-session';
import {createStorage} from 'gmp/testing';

describe('DefaultSession tests', () => {
  test('should create a no-session if storage is empty', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.username).toBeUndefined();
  });

  test('should create a user session if valid token and sessionTimeout are stored', () => {
    testing.useFakeTimers();
    testing.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const storage = createStorage({
      token: 'test-token',
      sessionTimeout: '2024-12-31T23:59:59Z',
      username: 'test-user',
    });
    const session = new DefaultSession(storage);

    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.username).toBe('test-user');
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();

    onTestFinished(() => {
      testing.useRealTimers();
    });
  });

  test('should create a user session if valid jwt and sessionTimeout are stored', () => {
    testing.useFakeTimers();
    testing.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const storage = createStorage({
      jwt: 'test-jwt',
      sessionTimeout: '2024-12-31T23:59:59Z',
      username: 'test-user',
    });
    const session = new DefaultSession(storage);

    expect(session.jwt).toBe('test-jwt');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.token).toBeUndefined();
    expect(session.username).toBe('test-user');
    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();

    onTestFinished(() => {
      testing.useRealTimers();
    });
  });

  test('should only return locale and timezone from storage if logged out', () => {
    const storage = createStorage({
      jwt: 'test-jwt',
      token: 'test-token',
      // sessionTimeout is in the past, so session should be considered logged out
      sessionTimeout: '2023-12-31T23:59:59Z',
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });
    const session = new DefaultSession(storage);

    expect(session.isLoggedIn()).toBe(false);

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.username).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
  });

  test('should not update session data if logged out', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    expect(session.isLoggedIn()).toBe(false);

    session.setLocale('en-US');
    session.setTimezone('UTC');
    session.setSessionTimeout(date('2024-12-31T23:59:59Z'));

    expect(session.locale).toBeUndefined();
    expect(session.timezone).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
  });

  test('should login and logout correctly', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    expect(session.isLoggedIn()).toBe(false);

    session.login({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(session.isLoggedIn()).toBe(true);

    expect(session.jwt).toBe('test-jwt');
    expect(session.token).toBe('test-token');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2024-12-31T23:59:59.000Z',
    );
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBe('test-user');

    session.logout();

    expect(session.isLoggedIn()).toBe(false);

    expect(session.jwt).toBeUndefined();
    expect(session.token).toBeUndefined();
    expect(session.sessionTimeout).toBeUndefined();
    expect(session.locale).toBe('en-US');
    expect(session.timezone).toBe('UTC');
    expect(session.username).toBeUndefined();
  });

  test('should allow to set locale, timezone and session timeout after login', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    session.login({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(session.isLoggedIn()).toBe(true);

    session.setLocale('fr-FR');
    session.setTimezone('CET');
    session.setSessionTimeout(date('2025-01-31T23:59:59Z'));

    expect(session.locale).toBe('fr-FR');
    expect(session.timezone).toBe('CET');
    expect(session.sessionTimeout?.toISOString()).toBe(
      '2025-01-31T23:59:59.000Z',
    );
  });

  test('should allow to be notified of session changes', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    const listener = testing.fn();
    const unsubscribe = session.subscribeToChanges(listener);

    session.login({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(listener).toHaveBeenCalledTimes(1);

    session.logout();

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();

    session.login({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('should call listeners when session data changes', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    session.login({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(session.isLoggedIn()).toBe(true);

    const listener = testing.fn();
    session.subscribeToChanges(listener);

    session.setLocale('fr-FR');
    expect(listener).toHaveBeenCalledTimes(1);

    session.setTimezone('CET');
    expect(listener).toHaveBeenCalledTimes(2);

    session.setSessionTimeout(date('2025-01-31T23:59:59Z'));
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test('should not call listeners when session data is set to the same value', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    session.login({
      jwt: 'test-jwt',
      token: 'test-token',
      sessionTimeout: date('2024-12-31T23:59:59Z'),
      locale: 'en-US',
      timezone: 'UTC',
      username: 'test-user',
    });

    expect(session.isLoggedIn()).toBe(true);

    const listener = testing.fn();
    session.subscribeToChanges(listener);

    session.setLocale('en-US');
    expect(listener).toHaveBeenCalledTimes(0);

    session.setTimezone('UTC');
    expect(listener).toHaveBeenCalledTimes(0);

    session.setSessionTimeout(date('2024-12-31T23:59:59Z'));
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test('should not call listeners when logged out', () => {
    const storage = createStorage();
    const session = new DefaultSession(storage);

    expect(session.isLoggedIn()).toBe(false);

    const listener = testing.fn();
    session.subscribeToChanges(listener);

    session.setLocale('fr-FR');
    expect(listener).toHaveBeenCalledTimes(0);

    session.setTimezone('CET');
    expect(listener).toHaveBeenCalledTimes(0);

    session.setSessionTimeout(date('2025-01-31T23:59:59Z'));
    expect(listener).toHaveBeenCalledTimes(0);

    session.setSessionTimeout(undefined);
    expect(listener).toHaveBeenCalledTimes(0);
  });
});
