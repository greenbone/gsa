/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useRef} from 'react';
import Logger from 'gmp/log';
import date, {type Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useSessionTimeout from 'web/hooks/useSessionTimeout';

interface PingProps {
  sessionTimeout: Date;
}

// number in the browser and NodeJS.Timer in NodeJS
type Timer = ReturnType<typeof globalThis.setTimeout>;

const log = Logger.getLogger('web.observer.sessionobserver');

const DELAY = 5 * 1000; // 5 seconds in milliseconds

const Ping = ({sessionTimeout}: PingProps) => {
  const gmp = useGmp();
  const timerRef = useRef<Timer | undefined>(undefined);

  const handlePing = useCallback(async () => {
    log.debug('pinging server to check session');
    timerRef.current = undefined;
    try {
      await gmp.user.ping();
    } catch {
      // the session might have expired and we will get a 401 here
    }
  }, [gmp]);

  const clearTimer = useCallback(() => {
    if (isDefined(timerRef.current)) {
      log.debug('clearing ping timer', timerRef.current);

      globalThis.clearTimeout(timerRef.current);

      timerRef.current = undefined;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isDefined(timerRef.current)) {
      return;
    }

    const timeout = sessionTimeout.diff(date()) + DELAY;

    if (timeout > 0) {
      const timeoutId = globalThis.setTimeout(handlePing, timeout);
      timerRef.current = timeoutId;

      log.debug(
        'started ping timer',
        timeoutId,
        'timeout',
        timeout,
        'milliseconds',
      );
    }
  }, [handlePing, sessionTimeout]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [clearTimer, startTimer]);

  return null;
};

const SessionObserver = () => {
  const [sessionTimeout] = useSessionTimeout();

  if (!isDefined(sessionTimeout)) {
    return null;
  }

  return <Ping key={sessionTimeout.unix()} sessionTimeout={sessionTimeout} />;
};

export default SessionObserver;
