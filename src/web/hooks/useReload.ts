/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect} from 'react';
import useTiming from 'web/hooks/useTiming';

type ReloadFunc = () => void;

interface TimeoutFuncParams {
  isVisible: boolean;
}

type TimeoutFunc = (params: TimeoutFuncParams) => number;

/**
 * A hook to reload data considering the visibility change of the browser tab.
 *
 * @param reloadFunc Function to call when the timer fires
 * @param timeoutFunc Function to get the timeout value from
 * @returns Array of startTimer function, clearTimer function and boolean isRunning
 */
const useReload = (
  reloadFunc: ReloadFunc,
  timeoutFunc: TimeoutFunc,
): [() => void, () => void, boolean] => {
  const timeout = useCallback(
    () => timeoutFunc({isVisible: !document.hidden}),
    [timeoutFunc],
  );

  const [startTimer, clearTimer, isRunning] = useTiming(reloadFunc, timeout);

  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;

    if (isVisible) {
      // browser tab is visible again
      // restart timer to get a possible shorter interval as the remaining time

      clearTimer();
      startTimer();
    }
  }, [clearTimer, startTimer]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return [startTimer, clearTimer, isRunning];
};

export default useReload;
