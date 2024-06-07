/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {useCallback, useState} from 'react';

const useFormValues = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);

  const handleValueChange = useCallback((value, name) => {
    // avoid re-render if value hasn't changed
    setValues(oldValues =>
      oldValues[name] === value ? oldValues : {...oldValues, [name]: value},
    );
  }, []);

  return [values, handleValueChange];
};

export default useFormValues;
