/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';

export interface SessionLoginData {
  jwt?: string;
  locale?: string;
  sessionTimeout?: Date;
  timezone?: string;
  token?: string;
  username?: string;
}

interface SessionState {
  jwt: string | undefined;
  locale: string | undefined;
  sessionTimeout: Date | undefined;
  timezone: string | undefined;
  token: string | undefined;
  username: string | undefined;

  readonly isLoggedIn: boolean;

  logout: () => SessionState;
  login: (data: SessionLoginData) => SessionState;
}

export default SessionState;
