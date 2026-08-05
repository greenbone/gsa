/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useRef} from 'react';

const useLatestCallback = <TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: TArgs) => callbackRef.current(...args), []);
};

export default useLatestCallback;
