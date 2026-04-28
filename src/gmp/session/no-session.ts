/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import type Session from 'gmp/session/session';
import {
  type default as SessionStorage,
  setSessionValue,
} from 'gmp/session/session-storage';

/**
 * NoSession class implements the Session interface but does not store any
 * session data besides locale and timezone. It is used as a default session
 * when no user session is available, allowing the application to function
 * without requiring user authentication.
 */
class NoSession implements Session {
  private storage: SessionStorage;

  constructor(storage: SessionStorage = globalThis.localStorage) {
    this.storage = storage;
  }

  get token(): string | undefined {
    return undefined;
  }

  set token(value: string | undefined) {
    // No-op
  }

  get sessionTimeout(): Date | undefined {
    return undefined;
  }

  set sessionTimeout(value: Date | undefined) {
    // No-op
  }

  get locale(): string | undefined {
    return this.storage.getItem('locale') ?? undefined;
  }

  set locale(value: string | undefined) {
    setSessionValue(this.storage, 'locale', value);
  }

  get timezone(): string | undefined {
    return this.storage.getItem('timezone') ?? undefined;
  }

  set timezone(value: string | undefined) {
    setSessionValue(this.storage, 'timezone', value);
  }

  get username(): string | undefined {
    return undefined;
  }

  set username(value: string | undefined) {
    // No-op
  }
}

export default NoSession;
