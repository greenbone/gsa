/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useRef} from 'react';

type SetInstanceVariable<T> = (value: T) => void;

/**
 * A hook to store an instance variable for a function component.
 *
 * This variable is persistent during render phases and changes to the variable
 * don't cause re-renders like useState does. It is comparable to storing a
 * variable to this in a class component.
 *
 * https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
 *
 * @param {*} initialValue Initial value of the variable. Can be any kind of
 *                         object. Most of the time it should be initialized
 *                         with an empty object.
 */
const useInstanceVariable = <T>(
  initialValue: T,
): [T, SetInstanceVariable<T>] => {
  const ref = useRef<T>(initialValue);
  const setInstanceVariable = useCallback((value: T) => {
    ref.current = value;
  }, []);
  return [ref.current, setInstanceVariable];
};

export default useInstanceVariable;
