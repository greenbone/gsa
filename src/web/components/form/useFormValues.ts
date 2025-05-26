/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useCallback, useState} from 'react';

type ValuesTypes<TValues> = TValues[keyof TValues];

const useFormValues = <TValues extends {}>(
  initialValues: TValues = {} as TValues,
): [TValues, (value: ValuesTypes<TValues>, name?: string) => void] => {
  const [values, setValues] = useState(initialValues);

  const handleValueChange = useCallback(
    (value: ValuesTypes<TValues>, name?: string) => {
      if (isDefined(name)) {
        // avoid re-render if value hasn't changed
        setValues(oldValues =>
          oldValues[name] === value ? oldValues : {...oldValues, [name]: value},
        );
      }
    },
    [],
  );

  return [values, handleValueChange];
};

export default useFormValues;
