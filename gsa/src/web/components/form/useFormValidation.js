/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/features/object/keys';

import {capitalizeFirstLetter} from 'gmp/utils/string';

import {useState, useEffect} from 'react';

export const parseAlias = string => {
  const parsedString = string.replace(/(_)/g, ' ').replace(/([A-Z])/g, ' $1');

  const words = parsedString.split(' ');
  let errorString = '';

  words.forEach(word => (errorString += capitalizeFirstLetter(word) + ' '));
  return errorString.trim(); // parse "name" to something human readable. Accepts underscores and camelcase. "credential_id" > "Credential Id", etc.
};

export const syncVariables = (values, formState, dependencies = {}) => {
  Object.keys(formState).forEach(key => (values[key] = formState[key]));
  Object.keys(dependencies).forEach(key => (values[key] = dependencies[key]));
}; // sync all form states with the values known to SaveDialog

const useFormValidation = (
  stateSchema,
  validationRules,
  callback,
  extras = {},
) => {
  const [formState, setFormState] = useState(stateSchema);
  const [dependencies, setDependencies] = useState(extras);
  const [errorMessage, setErrorMessage] = useState('');
  const [shouldWarn, setWarn] = useState(false); // shouldWarn is false when first rendered. Only when calling handleSubmit for the first time will this be set to true.

  const [formStatus, setFormStatus] = useState(stateSchema); // use the same shape as stateschema

  const handleValueChange = (value, name) => {
    setFormState(prevValues => ({...prevValues, [name]: value}));
  };

  const handleDependencyChange = (value, name) => {
    setDependencies(prevValues => ({...prevValues, [name]: value}));
  };

  // eslint-disable-next-line no-shadow
  const validate = (value, name, dependencies) => {
    setFormStatus(validity => ({
      ...validity,
      [name]: validationRules[name](value, dependencies),
    }));
  };

  useEffect(() => {
    Object.keys(formState).forEach(key => {
      validate(formState[key], key, dependencies);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, dependencies]);

  const handleSubmit = vals => {
    setWarn(true);
    const errorVars = [];
    Object.keys(formState).forEach(key => {
      !formStatus[key].validity && errorVars.push(parseAlias(key)); // Collects form fields with errors
    });

    const hasErrorInState = Object.keys(formState).some(key => {
      return formStatus[key].validity === false;
    }, []); // checks if any field is invalid

    if (hasErrorInState) {
      setErrorMessage('Error in fields: ' + errorVars.join(', ').toString()); // Outputs an error string containing all errors, or does nothing at all except show error bubbles. This is good for multi step dialogs.
    } else {
      // eslint-disable-next-line callback-return
      return callback(vals); // if nothing is wrong, call onSave
    }
  };

  return {
    dependencies,
    errorMessage,
    shouldWarn,
    formStatus,
    formState,
    handleDependencyChange,
    handleSubmit,
    handleValueChange,
  };
};

// Some common validation rules
export const testNonEmptyString = (string = '') => string.trim().length > 0;
export const testValidPassword = (password = '') => password.length > 5;

export default useFormValidation;
