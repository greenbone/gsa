/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useEffect, useRef, useCallback} from 'react';

import {useSelector} from 'react-redux';

import Logger from 'gmp/log';

import moment from 'gmp/models/date';

import {isDefined, hasValue} from 'gmp/utils/identity';

import {useLazyIsAuthenticated} from 'web/graphql/auth';

import {getSessionTimeout} from 'web/store/usersettings/selectors';

import useGmp from 'web/utils/useGmp';

const log = Logger.getLogger('web.observer.sessionobserver');

const DELAY = 15 * 1000; // 15 seconds in milliseconds

// allow to set timeout functions for testing purposes
let setTimeoutFunc = global.setTimeout;
let clearTimeoutFunc = global.clearTimeout;

export const setTimeoutFuncForTesting = timeoutFunc =>
  (setTimeoutFunc = timeoutFunc);

export const setClearTimeoutFuncForTesting = timeoutFunc =>
  (clearTimeoutFunc = timeoutFunc);

const SessionTimeout = ({sessionTimeout}) => {
  const timerRef = useRef();
  const gmp = useGmp();

  const [getIsAuthenticated, {isAuthenticated}] = useLazyIsAuthenticated();

  const handleTimer = useCallback(() => {
    log.debug(
      'session timer',
      timerRef.current,
      'has fired. Checking authentication status.',
    );

    timerRef.current = undefined;

    getIsAuthenticated();
  }, [getIsAuthenticated]);

  const startTimer = useCallback(() => {
    const timeout = sessionTimeout.diff(moment()) + DELAY;

    if (timeout > 0) {
      timerRef.current = setTimeoutFunc(handleTimer, timeout);

      log.debug(
        'started session timer',
        timerRef.current,
        'timeout',
        timeout,
        'milliseconds',
      );
    }
  }, [sessionTimeout, handleTimer]);

  useEffect(() => {
    // will be called on mount and if sessionTimeout changes
    startTimer();
    return () => {
      // remove timer if the component is unmounted or sessionTimeout has changed
      if (hasValue(timerRef.current)) {
        log.debug('clearing session timer', timerRef.current);

        clearTimeoutFunc(timerRef.current);
      }
    };
  }, [sessionTimeout, startTimer]);

  useEffect(() => {
    if (hasValue(isAuthenticated) && !isAuthenticated) {
      log.debug('Session has ended.');

      gmp.logout();
    }
  }, [isAuthenticated, gmp]);

  return null;
};

const SessionObserver = () => {
  const sessionTimeout = useSelector(getSessionTimeout);

  if (!isDefined(sessionTimeout)) {
    return null;
  }

  return <SessionTimeout sessionTimeout={sessionTimeout} />;
};

export default SessionObserver;

// vim: set ts=2 sw=2 tw=80:
