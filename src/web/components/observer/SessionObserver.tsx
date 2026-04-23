/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect} from 'react';
import Logger from 'gmp/log';
import date, {type Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useInstanceVariable from 'web/hooks/useInstanceVariable';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';

interface PingProps {
  sessionTimeout: Date;
}

// number in the browser and NodeJS.Timer in NodeJS
type Timer = ReturnType<typeof globalThis.setTimeout>;

const log = Logger.getLogger('web.observer.sessionobserver');

const DELAY = 15 * 1000; // 5 seconds in milliseconds

const Ping = ({sessionTimeout}: PingProps) => {
  const gmp = useGmp();
  const [timer, setTimer] = useInstanceVariable<Timer | undefined>(undefined);

  const handlePing = useCallback(async () => {
    log.debug('pinging server to check session');
    setTimer(undefined);
    try {
      await gmp.user.ping();
    } catch {
      // the session might have expired and we will get a 401 here
    }
  }, [gmp, setTimer]);

  const clearTimer = useCallback(() => {
    if (isDefined(timer)) {
      log.debug('clearing ping timer', timer);

      globalThis.clearTimeout(timer);

      setTimer(undefined);
    }
  }, [timer, setTimer]);

  const startTimer = useCallback(() => {
    if (isDefined(timer)) {
      return;
    }

    const timeout = sessionTimeout.diff(date()) + DELAY;

    if (timeout > 0) {
      const timer = globalThis.setTimeout(handlePing, timeout);
      setTimer(timer);

      log.debug(
        'started ping timer',
        timer,
        'timeout',
        timeout,
        'milliseconds',
      );
    }
  }, [handlePing, sessionTimeout, setTimer, timer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [clearTimer, startTimer]);

  return null;
};

const SessionObserver = () => {
  const [sessionTimeout] = useUserSessionTimeout();

  if (!isDefined(sessionTimeout)) {
    return null;
  }

  return <Ping key={sessionTimeout.unix()} sessionTimeout={sessionTimeout} />;
};

export default SessionObserver;
