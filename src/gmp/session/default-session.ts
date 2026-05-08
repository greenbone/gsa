/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import date, {type Date} from 'gmp/models/date';
import NoSessionState from 'gmp/session/no-session-state';
import {
  type SessionListener,
  type default as Session,
} from 'gmp/session/session';
import {
  type default as SessionState,
  type SessionLoginData,
} from 'gmp/session/session-state';
import {type default as SessionStorage} from 'gmp/session/session-storage';
import UserSessionState from 'gmp/session/user-session-state';
import {isDefined} from 'gmp/utils/identity';

const isLoggedIn = (storage: SessionStorage): boolean => {
  const token = storage.getItem('token');
  const username = storage.getItem('username');
  const sessionTimeoutStr = storage.getItem('sessionTimeout');
  const jwt = storage.getItem('jwt');
  if ((!token && !jwt) || !username || !sessionTimeoutStr) {
    return false;
  }
  const sessionTimeout = date(sessionTimeoutStr);
  return sessionTimeout > date();
};

class DefaultSession implements Session {
  private state: SessionState;
  private listeners: SessionListener[];

  constructor(storage: SessionStorage = globalThis.localStorage) {
    this.state = isLoggedIn(storage)
      ? new UserSessionState(storage)
      : new NoSessionState(storage);
    this.listeners = [];
  }

  get jwt(): string | undefined {
    return this.state.jwt;
  }

  get token(): string | undefined {
    return this.state.token;
  }

  get sessionTimeout(): Date | undefined {
    return this.state.sessionTimeout;
  }

  get locale(): string | undefined {
    return this.state.locale;
  }

  get timezone(): string | undefined {
    return this.state.timezone;
  }

  get username(): string | undefined {
    return this.state.username;
  }

  setTimezone(timezone?: string) {
    const oldTimezone = this.state.timezone;
    this.state.timezone = timezone;
    if (oldTimezone !== this.state.timezone) {
      this.notifyListeners();
    }
  }

  setLocale(locale?: string) {
    const oldLocale = this.state.locale;
    this.state.locale = locale;
    if (oldLocale !== this.state.locale) {
      this.notifyListeners();
    }
  }

  setSessionTimeout(sessionTimeout?: Date) {
    const oldSessionTimeout = this.state.sessionTimeout;
    this.state.sessionTimeout = sessionTimeout;
    if (
      isDefined(oldSessionTimeout) &&
      oldSessionTimeout.isSame(sessionTimeout) !== true
    ) {
      this.notifyListeners();
    }
  }

  logout() {
    this.setState(this.state.logout());
  }

  login(data: SessionLoginData) {
    this.setState(this.state.login(data));
  }

  isLoggedIn() {
    return this.state.isLoggedIn;
  }

  subscribeToChanges(listener: SessionListener) {
    this.listeners.push(listener);

    return () => (this.listeners = this.listeners.filter(l => l !== listener));
  }

  private setState(newState: SessionState) {
    this.state = newState;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export default DefaultSession;
