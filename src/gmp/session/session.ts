/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {type SessionLoginData} from 'gmp/session/session-state';

export type SessionListener = () => void;

/**
 * Session interface defines the structure of the user session data, including JWT, token,
 * session timeout, locale, timezone, and username.
 */
interface Session {
  readonly jwt: string | undefined;
  readonly locale: string | undefined;
  readonly sessionTimeout: Date | undefined;
  readonly timezone: string | undefined;
  readonly token: string | undefined;
  readonly username: string | undefined;

  setTimezone: (timezone?: string) => void;
  setLocale: (locale?: string) => void;
  setSessionTimeout: (sessionTimeout?: Date) => void;
  logout: () => void;
  login: (data: SessionLoginData) => void;
  isLoggedIn: () => boolean;
  subscribeToChanges: (listener: SessionListener) => () => void;
}

export default Session;
