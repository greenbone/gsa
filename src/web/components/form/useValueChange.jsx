/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';

import {isDefined} from 'gmp/utils/identity';

const eventTargetValue = event => event.target.value;
const noOpConvert = value => value;
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
const useValueChange = ({
  disabled,
  name,
  onChange,
  convert = noOpConvert,
  valueFunc = eventTargetValue,
}) => {
  const notifyChange = useCallback(
    value => {
      if (isDefined(onChange) && !disabled) {
        onChange(value, name);
      }
    },
    [disabled, name, onChange],
  );

  const handleChange = useCallback(
    event => {
      notifyChange(convert(valueFunc(event)));
    },
    [notifyChange, convert, valueFunc],
  );

  return handleChange;
};

export default useValueChange;
