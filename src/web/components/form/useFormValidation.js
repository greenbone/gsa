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

import {hasValue, isDefined, isFunction} from 'gmp/utils/identity';

import Theme from 'web/utils/theme';

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
  validationRules,
  values,
  {onValidationSuccess, onValidationError, fieldsToValidate},
) => {
  const [hasError, setHasError] = useState(false);
  const [errors, setErrors] = useState(() => {
    const fieldNames = fieldsToValidate ?? Object.keys(values);
    return fieldNames.reduce((status, name) => {
      status[name] = {};
      return status;
    }, {});
  });

  const validateValue = useCallback(
    (value, name) => {
      const validationRule = validationRules[name];
      let validity;

      try {
        validity = isFunction(validationRule)
          ? validationRule(value, values)
          : undefined;
      } catch (e) {
        validity = e.message;
      }

      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: validity,
      }));

      return validity;
    },
    [validationRules, values],
  );

  useEffect(() => {
    // update validity status e.g. to remove errors if a user has set a
    // correct value now
    const fieldNames = fieldsToValidate ?? Object.keys(values);
    fieldNames.forEach(name => validateValue(values[name], name, values));
  }, [fieldsToValidate, validateValue, values]);

  const validate = useCallback(
    formValues => {
      const fieldNames = fieldsToValidate ?? Object.keys(formValues);

      const hasErrorInState = fieldNames.some(name => hasValue(errors[name])); // checks if any field is invalid

      setHasError(hasErrorInState);

      if (hasErrorInState) {
        if (isDefined(onValidationError)) {
          onValidationError(
            _(
              'This form received invalid values. Please check the inputs and ' +
                'submit again.',
            ),
          );
        }
      } else if (isDefined(onValidationSuccess)) {
        onValidationSuccess(formValues);
      }
    },
    [fieldsToValidate, onValidationError, onValidationSuccess, errors],
  );

  return {
    hasError,
    errors,
    validate,
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
