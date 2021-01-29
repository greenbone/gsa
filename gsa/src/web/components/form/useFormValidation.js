/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useState, useEffect, useCallback} from 'react';

import styled from 'styled-components';

import {_, _l} from 'gmp/locale/lang';

import {isFunction} from 'gmp/utils/identity';

import Theme from 'web/utils/theme';

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
  validationSchema,
  validationRules,
  onValidationSuccess,
  deps = {},
) => {
  const [formValues, setFormValues] = useState(validationSchema);
  const [dependencies, setDependencies] = useState(deps);
  const [errorMessage, setErrorMessage] = useState();
  const [shouldWarn, setShouldWarn] = useState(false); // shouldWarn is false when first rendered. Only when calling handleSubmit for the first time will this be set to true.

  const [validityStatus, setValidityStatus] = useState(validationSchema); // use the same shape as stateschema

  const handleValueChange = useCallback((value, name) => {
    setFormValues(prevValues => ({...prevValues, [name]: value}));
  }, []);

  const handleDependencyChange = useCallback((value, name) => {
    setDependencies(prevValues => ({...prevValues, [name]: value}));
  }, []);

  // eslint-disable-next-line no-shadow
  const validate = (value, name, dependencies) => {
    setValidityStatus(prevValidityStatus => {
      const validationRule = validationRules[name];
      return {
        ...prevValidityStatus,
        [name]: isFunction(validationRule)
          ? validationRule(value, dependencies)
          : undefined,
      };
    });
  };

  useEffect(() => {
    Object.keys(validationSchema).forEach(key => {
      validate(formValues[key], key, dependencies);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, dependencies]);

  const handleSubmit = values => {
    setShouldWarn(true);

    const hasErrorInState = Object.keys(formValues).some(key => {
      return validityStatus[key]?.isValid === false;
    }, []); // checks if any field is invalid

    if (hasErrorInState) {
      setErrorMessage(
        _(
          'This form received invalid values. Please check the inputs and submit again.',
        ),
      );
    } else {
      // eslint-disable-next-line callback-return
      return onValidationSuccess(values); // if nothing is wrong, call onSave
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
  string.match(/^[.#\-_ ,/a-z0-9äüöÄÜÖß]+$/i) !== null; // this is analogue to the
// regex in gsad.c for 'name' - it needs to be checked, whether :alnum: contains
// more than the characters above
export const VALID_NAME_ERROR_MESSAGE = _l(
  'The name must include at least one alphanumeric character or one of .,-/_# and space.',
);
export default useFormValidation;
