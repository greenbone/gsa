/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef} from 'react';

/**
 * React custom hook to store the value of the previous rendering
 *
 * It allows for checking if a value has changed since last render.
 *
 * Code Snippet
 *
 * ```
 * const [value, setValue] = useState(initialValue);
 * const previousValue = usePrevious(value);
 *
 * if (value !== previousValue) { // value has changed
 *     doSomething()
 * }
 * ```
 */
const usePreviousValue = <TValue>(value: TValue) => {
  const ref = useRef<TValue>(); // initially the previous value is undefined

  useEffect(() => {
    // will be called AFTER the calling component has rendered
    ref.current = value;
  });

  return ref.current;
};

export default usePreviousValue;
