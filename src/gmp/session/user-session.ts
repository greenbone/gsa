/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import date, {type Date} from 'gmp/models/date';
import type Session from 'gmp/session/session';
import {
  type default as SessionStorage,
  setSessionValue,
} from 'gmp/session/session-storage';
import {hasValue, isDefined} from 'gmp/utils/identity';

interface UserSessionData {
  token?: string;
  sessionTimeout?: Date;
  locale?: string;
  timezone?: string;
  username?: string;
}

/**
 * UserSession class manages the user's session data, including JWT, token,
 * session timeout, locale, timezone, and username.
 */
class UserSession implements Session {
  private storage: SessionStorage;

  constructor(
    storage: SessionStorage = globalThis.localStorage,
    {token, sessionTimeout, locale, timezone, username}: UserSessionData = {},
  ) {
    this.storage = storage;
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
    return hasValue(value) ? date(value) : undefined;
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
}

export default UserSession;
