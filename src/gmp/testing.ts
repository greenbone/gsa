/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing} from '@gsa/testing';
import {type Date} from 'gmp/models/date';
import type Session from 'gmp/session/session';
import {type SessionLoginData} from 'gmp/session/session-state';

interface MockSession extends Session {
  listener: (() => void)[];
}

interface MockSessionOptions {
  token?: string;
  sessionTimeout?: Date;
  timezone?: string;
  username?: string;
  locale?: string;
  listener?: (() => void)[];
  isLoggedIn?: () => boolean;
  subscribeToChanges?: (callback: () => void) => () => void;
  setTimezone?: (timezone?: string) => void;
  setLocale?: (locale?: string) => void;
  logout?: () => void;
  login?: (data: SessionLoginData) => void;
}

export const createSession = ({
  listener = [],
  locale,
  sessionTimeout,
  timezone,
  token,
  username,
  isLoggedIn = testing.fn().mockReturnValue(true),
  subscribeToChanges = testing.fn().mockImplementation(callback => {
    listener.push(callback);
    callback();
    return () => {};
  }),
  setTimezone = testing.fn(),
  setLocale = testing.fn(),
  logout = testing.fn(),
  login = testing.fn(),
}: MockSessionOptions = {}): MockSession => ({
  listener,
  locale,
  sessionTimeout,
  timezone,
  token,
  username,
  isLoggedIn,
  login,
  logout,
  setLocale,
  setTimezone,
  subscribeToChanges,
});
