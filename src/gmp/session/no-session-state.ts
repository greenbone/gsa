/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {
  type SessionLoginData,
  type default as SessionState,
} from 'gmp/session/session-state';
import {type default as SessionStorage} from 'gmp/session/session-storage';
import UserSessionState from 'gmp/session/user-session-state';

/**
 * NoSessionState class implements the SessionState interface but does not store
 * any user-specific session data. It serves as a default state when there is no
 * active user session.
 */
class NoSessionState implements SessionState {
  private readonly storage: SessionStorage;

  readonly isLoggedIn = false;

  constructor(storage: SessionStorage = globalThis.localStorage) {
    this.storage = storage;
  }

  get jwt(): string | undefined {
    return undefined;
  }

  set jwt(value: string | undefined) {
    // No session JWT is stored in NoSessionState
  }

  get token(): string | undefined {
    return undefined;
  }

  set token(value: string | undefined) {
    // No session token is stored in NoSessionState
  }

  get sessionTimeout(): Date | undefined {
    return undefined;
  }

  set sessionTimeout(value: Date | undefined) {
    // No session timeout is stored in NoSessionState
  }

  get locale(): string | undefined {
    return this.storage.getItem('locale') ?? undefined;
  }

  set locale(value: string | undefined) {
    // No-op
  }

  get timezone(): string | undefined {
    return this.storage.getItem('timezone') ?? undefined;
  }

  set timezone(value: string | undefined) {
    // No-op
  }

  get username(): string | undefined {
    return undefined;
  }

  set username(value: string | undefined) {
    // No session username is stored in NoSessionState
  }

  login(data: SessionLoginData): SessionState {
    return new UserSessionState(this.storage, data);
  }

  logout(): SessionState {
    return this;
  }
}

export default NoSessionState;
