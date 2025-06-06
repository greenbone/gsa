/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {hasValue, isDefined, isFunction} from 'gmp/utils/identity';

type ValidationFunc<TValue, TValues> = (
  value: TValue,
  values?: TValues,
) => string | undefined | void;

type ValidationRules<TValues> = {
  [K in keyof TValues]: ValidationFunc<TValues[K], TValues>;
};

type ErrorType<TValues> = {
  [K in keyof TValues]?: string | undefined;
};

const useFormValidation = <TValues extends {}>(
  validationRules: ValidationRules<TValues>,
  values: TValues,
  {
    onValidationSuccess,
    onValidationError,
    fieldsToValidate,
  }: {
    onValidationSuccess?: (values: TValues) => void;
    onValidationError?: (message: string) => void;
    fieldsToValidate?: string[];
  },
) => {
  const [hasError, setHasError] = useState(false);
  const [errors, setErrors] = useState<ErrorType<TValues>>({});

  const validateValue = useCallback(
    (value: unknown, name: string) => {
      const validationRule = validationRules[name];
      let validity: string | undefined | void;

      try {
        validity = isFunction(validationRule)
          ? validationRule(value, values)
          : undefined;
      } catch (e) {
        validity = (e as Error).message;
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
    fieldNames.forEach(name => validateValue(values[name], name));
  }, [fieldsToValidate, validateValue, values]);

  const validate = useCallback(
    (formValues: TValues) => {
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
export const shouldBeNonEmpty = (string: string = '') =>
  String(string).trim().length > 0;
export const shouldBeValidPassword = (password: string = '') =>
  password.length > 5;
export const shouldBeValidName = (string: string = '') =>
  string.match(/^[.#\-_ ,/a-z0-9äüöÄÜÖß]+$/i) !== null; // this is analogue to the
// regex in gsad.c for 'name' - it needs to be checked, whether :alnum: contains
// more than the characters above
export const VALID_NAME_ERROR_MESSAGE = _l(
  'The name must include at least one alphanumeric character or one of .,-/_# and space.',
);
export default useFormValidation;
