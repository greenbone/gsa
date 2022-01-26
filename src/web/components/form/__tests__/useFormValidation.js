/* Copyright (C) 2019-2022 Greenbone Networks GmbH
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

/* eslint-disable react/prop-types */

import React, {useState} from 'react';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import TextField from '../textfield';
import Button from '../button';

import useFormValidation, {shouldBeNonEmpty} from '../useFormValidation';
import useFormValues from '../useFormValues';

/*
 * This suite only tests functions associated with useFormValidation.
 * The hook itself should be tested with whichever dialog
 * component it is called with.
 */

const validationRules = {
  foo: value => {
    if (value !== '' && value !== 'foo') {
      throw Error('Value must be foo!');
    }
  },
};
const fieldsToValidate = ['foo'];

const UseFormValidationTestComponent = ({onSave}) => {
  const [values, handleValueChange] = useFormValues({foo: ''});
  const [error, setError] = useState();
  const {hasError, errors, validate} = useFormValidation(
    validationRules,
    values,
    {
      onValidationSuccess: onSave,
      onValidationError: setError,
      fieldsToValidate,
    },
  );
  return (
    <React.Fragment>
      <div data-testid="value">{values.foo}</div>
      {hasError && <span data-testid="error">{error}</span>}
      <TextField
        name="foo"
        data-testid="foo"
        value={values.foo}
        hasError={hasError && !!errors.foo}
        errorContent={errors.foo}
        onChange={handleValueChange}
      />
      <Button data-testid="button" onClick={() => validate(values)} />
    </React.Fragment>
  );
};

describe('useFormValidation tests', () => {
  test('should validate form value successfully', async () => {
    const {render} = rendererWith();
    const handleSave = jest.fn();

    render(<UseFormValidationTestComponent onSave={handleSave} />);

    fireEvent.change(screen.getByTestId('foo'), {target: {value: 'foo'}});

    fireEvent.click(screen.getByTestId('button'));

    expect(handleSave).toHaveBeenCalled();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('should show error if validation fails', async () => {
    const {render} = rendererWith();
    const handleSave = jest.fn();

    render(<UseFormValidationTestComponent onSave={handleSave} />);

    fireEvent.change(screen.getByTestId('foo'), {target: {value: 'ipsum'}});

    expect(screen.getByTestId('value')).toHaveTextContent('ipsum');

    fireEvent.click(screen.getByTestId('button'));

    expect(screen.getByTestId('error')).toHaveTextContent(
      'This form received invalid values. Please check the inputs and' +
        ' submit again.',
    );
    expect(handleSave).not.toHaveBeenCalled();
  });
});

describe('Testing useFormValidation utilities', () => {
  test('testNonemptyString tests', () => {
    const term1 = 'lorem ipsum';
    const term2 = ' ';

    expect(shouldBeNonEmpty(term1)).toBe(true);
    expect(shouldBeNonEmpty(term2)).toBe(false);
    expect(shouldBeNonEmpty('')).toBe(false);
    expect(shouldBeNonEmpty()).toBe(false);
  });
});
