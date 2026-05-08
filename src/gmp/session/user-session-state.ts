/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import memoizeOne from 'memoize-one';
import date, {type Date} from 'gmp/models/date';
import NoSessionState from 'gmp/session/no-session-state';
import {
  type default as SessionState,
  type SessionLoginData,
} from 'gmp/session/session-state';
import {
  type default as SessionStorage,
  setSessionValue,
} from 'gmp/session/session-storage';
import {hasValue, isDefined} from 'gmp/utils/identity';

const memoizedDate = memoizeOne((value: string): Date => date(value));

/**
 * UserSession class manages the user's session data, including JWT, token,
 * session timeout, locale, timezone, and username.
 */
class UserSessionState implements SessionState {
  private readonly storage: SessionStorage;

  readonly isLoggedIn = true;

  constructor(
    storage: SessionStorage = globalThis.localStorage,
    {
      jwt,
      locale,
      sessionTimeout,
      timezone,
      token,
      username,
    }: SessionLoginData = {},
  ) {
    this.storage = storage;
    if (isDefined(jwt)) {
      this.jwt = jwt;
    }
    if (isDefined(locale)) {
      this.locale = locale;
    }
    if (isDefined(sessionTimeout)) {
      this.sessionTimeout = sessionTimeout;
    }
    if (isDefined(timezone)) {
      this.timezone = timezone;
    }
    if (isDefined(token)) {
      this.token = token;
    }
    if (isDefined(username)) {
      this.username = username;
    }
  }

  set jwt(value: string | undefined) {
    setSessionValue(this.storage, 'jwt', value);
  }

  get jwt(): string | undefined {
    return this.storage.getItem('jwt') ?? undefined;
  }

  set locale(value: string | undefined) {
    setSessionValue(this.storage, 'locale', value);
  }

  get locale(): string | undefined {
    return this.storage.getItem('locale') ?? undefined;
  }

  set sessionTimeout(value: Date | undefined) {
    setSessionValue(this.storage, 'sessionTimeout', value?.toISOString());
  }

  get sessionTimeout(): Date | undefined {
    const value = this.storage.getItem('sessionTimeout');
    return hasValue(value) ? memoizedDate(value) : undefined;
  }

  set token(value: string | undefined) {
    setSessionValue(this.storage, 'token', value);
  }

  get token(): string | undefined {
    return this.storage.getItem('token') ?? undefined;
  }

  set timezone(value: string | undefined) {
    setSessionValue(this.storage, 'timezone', value);
  }

  get timezone(): string | undefined {
    return this.storage.getItem('timezone') ?? undefined;
  }

  set username(value: string | undefined) {
    setSessionValue(this.storage, 'username', value);
  }

  get username(): string | undefined {
    return this.storage.getItem('username') ?? undefined;
  }

  login(_data: SessionLoginData): UserSessionState {
    // No-op since we're already logged in
    return this;
  }

  logout(): SessionState {
    this.jwt = undefined;
    this.token = undefined;
    this.sessionTimeout = undefined;
    this.username = undefined;
    return new NoSessionState(this.storage);
  }
}

export default UserSessionState;
