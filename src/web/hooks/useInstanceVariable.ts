/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Dispatch, useCallback, useRef} from 'react';
import {isFunction} from 'gmp/utils/identity';

type SetInstanceVariable<T> = T | ((previousValue: T) => T);

/**
 * A hook to store an instance variable for a function component.
 *
 * This variable is persistent during render phases and changes to the variable
 * don't cause re-renders like useState does. It is comparable to storing a
 * variable to this in a class component.
 *
 * https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
 *
 * Example usages:
 * ```tsx
 * const [someVariable, setVariable] = useInstanceVariable(1);
 * // someVariable is 1
 * setVariable(2);
 * // someVariable is 2, but the component is not re-rendered
 * // to reflect the changed value of someVariable
 * ```
 *
 * ```tsx
 * const [someVariable, setVariable] = useInstanceVariable({count: 1});
 * // someVariable is {count: 1}
 * setVariable(prev => ({count: prev.count + 1}));
 * // someVariable is {count: 2}, but the component is not re-rendered
 * // to reflect the changed value of someVariable
 * ```
 *
 * @param {*} initialValue Initial value of the variable. Can be any kind of
 *                         object. Most of the time it should be initialized
 *                         with an empty object.
 */
const useInstanceVariable = <T>(
  initialValue: T,
): [T, Dispatch<SetInstanceVariable<T>>] => {
  const ref = useRef<T>(initialValue);
  const setInstanceVariable = useCallback((value: SetInstanceVariable<T>) => {
    ref.current = isFunction(value) ? value(ref.current) : value;
  }, []);
  return [ref.current, setInstanceVariable];
};

export default useInstanceVariable;
