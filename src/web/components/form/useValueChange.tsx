/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useCallback} from 'react';

interface UseValueChangeParams<T> {
  disabled?: boolean;
  name?: string;
  onChange?: (value: T, name?: string) => void;
  convert?: (value: unknown) => T;
  valueFunc?: (event: React.ChangeEvent<HTMLInputElement>) => unknown;
}

const eventTargetValue = (event: React.ChangeEvent<HTMLInputElement>) =>
  event.target.value;
const noOpConvert = <T,>(value: unknown): T => value as T;
/**
 * A hook that handles the change of a value of an input field.
 *
 * It gets the event target value and optionally converts it.
 * value and name are passed to the onChange function.
 *
 * @param {Object} param0 An object with the following properties:
 *  - disabled: A boolean that indicates if the value can be changed.
 *  - name: A string that represents the name of the value.
 *  - onChange: A function that is called when the value changes.
 *  - convert: A function that converts the value optionally.
 *  - valueFunc: A function that gets the value from the event. Defaults to event.target.value.
 * @returns A function as a callback that handles the change of a value in an input field.
 */
const useValueChange = <T,>({
  disabled = false, // Default to false
  name,
  onChange,
  convert = noOpConvert,
  valueFunc = eventTargetValue,
}: UseValueChangeParams<T>) => {
  const notifyChange = useCallback(
    (value: T) => {
      if (isDefined(onChange) && !disabled) {
        onChange(value, name);
      }
    },
    [disabled, name, onChange],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      notifyChange(convert(valueFunc(event)));
    },
    [notifyChange, convert, valueFunc],
  );

  return handleChange;
};

export default useValueChange;
