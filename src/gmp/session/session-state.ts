/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';

export interface SessionLoginData {
  token?: string;
  sessionTimeout?: Date;
  locale?: string;
  timezone?: string;
  username?: string;
}

interface SessionState {
  token: string | undefined;
  sessionTimeout: Date | undefined;
  locale: string | undefined;
  timezone: string | undefined;
  username: string | undefined;

  logout: () => SessionState;
  login: (data: SessionLoginData) => SessionState;
}

export default SessionState;
