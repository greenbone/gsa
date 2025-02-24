/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import {hasValue, isFunction} from 'gmp/utils/identity';
import {useEffect, useCallback, useState} from 'react';
import useInstanceVariable from 'web/hooks/useInstanceVariable';

const log = logger.getLogger('web.hooks.useTiming');

/**
 * Hook to start a timer that calls a function after a given timeout
 *
 * @param {Function} doFunc The function to call
 * @param {Number|Function} timeout The timeout in milliseconds or a function that returns the timeout
 * @returns Array of startTimer function, clearTimer function and boolean isRunning
 */
const useTiming = (doFunc, timeout) => {
  const timer = useInstanceVariable({});
  const [timerId, setTimerId] = useState(); // store timerId in state too to trigger re-render if it changes
  const isRunning = Boolean(timerId);
  timer.doFunc = doFunc; // always use the latest version of the function

  const updateTimerId = useCallback(
    newTimerId => {
      timer.timerId = newTimerId;
      setTimerId(newTimerId);
    },
    [timer],
  );

  const startTimer = useCallback(() => {
    if (hasValue(timer.timerId)) {
      log.debug('Not starting timer. A timer is already running.', {
        timer: timer.timerId,
      });
      return;
    }

    const timeoutValue = isFunction(timeout) ? timeout() : timeout;

    if (!hasValue(timeoutValue) || timeoutValue < 0) {
      log.debug('Not starting timer because timeout value was', timeoutValue);
      return;
    }

    updateTimerId(
      setTimeout(async () => {
        log.debug('Timer with id', timer.timerId, 'fired.');

        const promise = timer.doFunc();
        try {
          if (promise?.then) {
            await promise;
            updateTimerId();
            timer.startTimer();
          } else {
            updateTimerId();
          }
        } catch {
          updateTimerId();
        }
      }, timeoutValue),
    );

    log.debug(
      'Started timer with id',
      timer.timerId,
      'and timeout of',
      timeoutValue,
      'milliseconds',
    );
  }, [timeout, timer, updateTimerId]);

  const clearTimer = useCallback(() => {
    if (hasValue(timer.timerId)) {
      log.debug('Clearing timer with id', timer.timerId);

      clearTimeout(timer.timerId);
      updateTimerId();
    }
  }, [timer, updateTimerId]);

  useEffect(() => {
    // put starTimer func into timer ref to allow referencing the NEWEST version
    // when a promise has ended
    timer.startTimer = startTimer;
  });

  // clear timer on unmount
  useEffect(
    () => () => {
      log.debug('Removing timer on unmount');
      clearTimer();
    },
    [clearTimer],
  );

  return [startTimer, clearTimer, isRunning];
};

export default useTiming;
