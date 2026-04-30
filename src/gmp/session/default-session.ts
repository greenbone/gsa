/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import date, {type Date} from 'gmp/models/date';
import NoSessionState from 'gmp/session/no-session-state';
import {type default as Session} from 'gmp/session/session';
import {
  type default as SessionState,
  type SessionLoginData,
} from 'gmp/session/session-state';
import {type default as SessionStorage} from 'gmp/session/session-storage';
import UserSessionState from 'gmp/session/user-session-state';

const isLoggedIn = (storage: SessionStorage): boolean => {
  const token = storage.getItem('token');
  const username = storage.getItem('username');
  const sessionTimeoutStr = storage.getItem('sessionTimeout');
  if (!token || !username || !sessionTimeoutStr) {
    return false;
  }
  const sessionTimeout = date(sessionTimeoutStr);
  return sessionTimeout > date();
};

class DefaultSession implements Session {
  private state: SessionState;

  constructor(storage: SessionStorage = globalThis.localStorage) {
    this.state = isLoggedIn(storage)
      ? new UserSessionState(storage)
      : new NoSessionState(storage);
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
    this.state.timezone = timezone;
  }

  setLocale(locale?: string) {
    this.state.locale = locale;
  }

  logout() {
    this.state = this.state.logout();
  }

  login(data: SessionLoginData) {
    this.state = this.state.login(data);
  }

  isLoggedIn() {
    return this.state.isLoggedIn;
  }
}

export default DefaultSession;
