/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';

/**
 * Session interface defines the structure of the user session data, including JWT, token,
 * session timeout, locale, timezone, and username.
 */
interface Session {
  token?: string;
  sessionTimeout?: Date;
  locale?: string;
  timezone?: string;
  username?: string;
}

export default Session;
