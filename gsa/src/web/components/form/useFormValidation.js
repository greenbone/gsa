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

import React, {useState, useEffect} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';
import {_l} from 'gmp/locale/lang';
import {capitalizeFirstLetter} from 'gmp/utils/string';

import Theme from 'web/utils/theme';

export const parseAlias = string => {
  const parsedString = string.replace(/(_)/g, ' ').replace(/([A-Z])/g, ' $1');

  const words = parsedString.split(' ');
  let errorString = '';

  words.forEach(word => (errorString += capitalizeFirstLetter(word) + ' '));
  return errorString.trim(); // parse "name" to something human readable. Accepts underscores and camelcase. "credential_id" > "Credential Id", etc.
};

export const syncVariables = (values, formValues, dependencies = {}) => {
  Object.keys(formValues).forEach(key => (values[key] = formValues[key]));
  Object.keys(dependencies).forEach(key => (values[key] = dependencies[key]));
}; // sync all form states with the values known to SaveDialog

const StyledMarker = styled.div`
  color: ${Theme.darkRed};
  color: ${props => props.color};
  font-weight: bold;
  font-size: 19px;
  padding-bottom: 1px;
  padding-left: 4px;
  display: ${props => (props.isVisible ? 'inline' : 'none')};
`;

export const Marker = props => (
  <StyledMarker {...props} data-testid="error-marker">
    ×
  </StyledMarker>
);

const useFormValidation = (
  stateSchema,
  validationRules,
  onValidationSuccess,
  deps = {},
) => {
  const [formValues, setFormState] = useState(stateSchema);
  const [dependencies, setDependencies] = useState(deps);
  const [errorMessage, setErrorMessage] = useState();
  const [shouldWarn, setShouldWarn] = useState(false); // shouldWarn is false when first rendered. Only when calling handleSubmit for the first time will this be set to true.

  const [validityStatus, setFormStatus] = useState(stateSchema); // use the same shape as stateschema

  const handleValueChange = (value, name) => {
    setFormState(prevValues => ({...prevValues, [name]: value}));
  };

  const handleDependencyChange = (value, name) => {
    setDependencies(prevValues => ({...prevValues, [name]: value}));
  };

  // eslint-disable-next-line no-shadow
  const validate = (value, name, dependencies) => {
    setFormStatus(prevValidityStatus => ({
      ...prevValidityStatus,
      [name]: validationRules[name](value, dependencies),
    }));
  };

  useEffect(() => {
    Object.keys(formValues).forEach(key => {
      validate(formValues[key], key, dependencies);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, dependencies]);

  const handleSubmit = vals => {
    setShouldWarn(true);
    const errorVars = [];
    Object.keys(formValues).forEach(key => {
      !validityStatus[key].isValid && errorVars.push(parseAlias(key)); // Collects form fields with errors
    });

    const hasErrorInState = Object.keys(formValues).some(key => {
      return validityStatus[key].isValid === false;
    }, []); // checks if any field is invalid

    if (hasErrorInState) {
      setErrorMessage(
        _('This form has errors. Please check the inputs and submit again.'),
      );
    } else {
      // eslint-disable-next-line callback-return
      return onValidationSuccess(vals); // if nothing is wrong, call onSave
    }
  };

  return {
    dependencies,
    errorMessage,
    shouldWarn,
    validityStatus,
    formValues,
    handleDependencyChange,
    handleSubmit,
    handleValueChange,
  };
};

// Some common validation rules
export const shouldBeNonEmpty = (string = '') => string.trim().length > 0;
export const shouldBeValidPassword = (password = '') => password.length > 5;
export const shouldBeValidName = (string = '') =>
  string.match(/^[.#\-_ ,/a-z0-9]+$/i) !== null; // this is analogue to the
// regex in gsad.c for 'name'
export const VALID_NAME_ERROR_MESSAGE = _l(
  'The name must include at least one alphanumeric character or one of .,-_# and space.',
);
export default useFormValidation;
