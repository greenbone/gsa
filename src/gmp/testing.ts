/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing} from '@gsa/testing';
import {type Date} from 'gmp/models/date';
import {
  type default as Session,
  type SessionListener,
} from 'gmp/session/session';
import {type SessionLoginData} from 'gmp/session/session-state';

interface MockSessionOptions {
  jwt?: string;
  locale?: string;
  sessionTimeout?: Date;
  timezone?: string;
  token?: string;
  username?: string;
  listener?: (() => void)[];
  isLoggedIn?: () => boolean;
  subscribeToChanges?: (callback: () => void) => () => void;
  setTimezone?: (timezone?: string) => void;
  setLocale?: (locale?: string) => void;
  setSessionTimeout?: (sessionTimeout?: Date) => void;
  logout?: () => void;
  login?: (data: SessionLoginData) => void;
}

class MockSession implements Session {
  public listener: SessionListener[];

  public jwt: string | undefined;
  public locale: string | undefined;
  public sessionTimeout: Date | undefined;
  public timezone: string | undefined;
  public token: string | undefined;
  public username: string | undefined;

  public setTimezone: (timezone?: string) => void;
  public setLocale: (locale?: string) => void;
  public setSessionTimeout: (sessionTimeout?: Date) => void;
  public logout: () => void;
  public login: (data: SessionLoginData) => void;
  public isLoggedIn: () => boolean;
  public subscribeToChanges: (listener: SessionListener) => () => void;

  constructor(options: MockSessionOptions = {}) {
    this.listener = options.listener ?? [];

    this.jwt = options.jwt;
    this.locale = options.locale;
    this.sessionTimeout = options.sessionTimeout;
    this.timezone = options.timezone ?? 'UTC';
    this.token = options.token;
    this.username = options.username;

    this.isLoggedIn = options.isLoggedIn ?? testing.fn().mockReturnValue(true);
    this.subscribeToChanges =
      options.subscribeToChanges ??
      testing.fn().mockImplementation(callback => {
        this.listener.push(callback);
        callback();
        return () => {};
      });
    this.setTimezone =
      options.setTimezone ??
      testing.fn().mockImplementation(timezone => {
        this.timezone = timezone;
        this.listener.forEach(listener => listener());
      });
    this.setLocale =
      options.setLocale ??
      testing.fn().mockImplementation(locale => {
        this.locale = locale;
        this.listener.forEach(listener => listener());
      });
    this.setSessionTimeout =
      options.setSessionTimeout ??
      testing.fn().mockImplementation(sessionTimeout => {
        this.sessionTimeout = sessionTimeout;
        this.listener.forEach(listener => listener());
      });
    this.logout = options.logout ?? testing.fn();
    this.login = options.login ?? testing.fn();
  }
}

export const createSession = ({
  listener = [],
  jwt,
  locale,
  sessionTimeout,
  timezone,
  token,
  username,
  isLoggedIn,
  subscribeToChanges,
  setTimezone,
  setLocale,
  logout,
  login,
}: MockSessionOptions = {}): MockSession => {
  return new MockSession({
    listener,
    jwt,
    locale,
    sessionTimeout,
    timezone,
    token,
    username,
    isLoggedIn,
    subscribeToChanges,
    setTimezone,
    setLocale,
    logout,
    login,
  });
};

export const createStorage = (state?: Record<string, string>) => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] || null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};
