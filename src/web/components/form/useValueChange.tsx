/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {isDefined} from 'gmp/utils/identity';

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface UseValueChangeParams<TValue, TChange> {
  disabled?: boolean;
  name?: string;
  onChange?: (value: TChange, name?: string) => void;
  convert?: (value: TValue) => TChange;
  valueFunc?: (event: ChangeEvent) => TValue;
}

const eventTargetValue = (event: ChangeEvent) => event.target.value;
const noOpConvert = <TValue,>(value: TValue): TValue => value;
/**
 * A hook that handles the change of a value of an input field.
 *
 * It gets the event target value and optionally converts it.
 * value and name are passed to the onChange function.
 *
 * @param object An object with the following properties:
 *  - disabled: A boolean that indicates if the value can be changed.
 *  - name: A string that represents the name of the value.
 *  - onChange: A function that is called when the value changes.
 *  - convert: A function that converts the value optionally.
 *  - valueFunc: A function that gets the value from the event. Defaults to event.target.value.
 * @returns A function as a callback that handles the change of a value in an input field.
 */
const useValueChange = <TConvert, TValue = string>({
  disabled = false, // Default to false
  name,
  onChange,
  convert = noOpConvert as (value: TValue) => TConvert,
  valueFunc = eventTargetValue as (event: ChangeEvent) => TValue,
}: UseValueChangeParams<TValue, TConvert>) => {
  const notifyChange = useCallback(
    (value: TConvert) => {
      if (isDefined(onChange) && !disabled) {
        onChange(value, name);
      }
    },
    [disabled, name, onChange],
  );

  const handleChange = useCallback(
    (event: ChangeEvent) => {
      notifyChange(convert(valueFunc(event)));
    },
    [notifyChange, convert, valueFunc],
  );

  return handleChange;
};

export default useValueChange;
