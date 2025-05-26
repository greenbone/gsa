/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import React, {useRef} from 'react';
import TextField from 'web/components/form/TextField';
import useFormValues from 'web/components/form/useFormValues';
import {fireEvent, rendererWith, wait, screen} from 'web/utils/Testing';

const UseFormValuesTestComponent = () => {
  const ref = useRef(0);
  ref.current++;

  const [values, handleValueChange] = useFormValues({foo: 'bar'});

  return (
    <React.Fragment>
      <span data-testid="renderCount">{ref.current}</span>
      <span data-testid="fooValue">{values.foo}</span>
      <button
        data-testid="changeToSameValue"
        onClick={() => handleValueChange('bar', 'foo')}
      />
      <TextField
        name="foo"
        value={values.foo}
        onChange={handleValueChange as (value: string, name?: string) => void}
      />
    </React.Fragment>
  );
};

describe('useFormValues tests', () => {
  test('should not re-render if same value is set', async () => {
    const {render} = rendererWith();

    const {getByName} = render(<UseFormValuesTestComponent />);

    const button = screen.getByTestId('changeToSameValue');

    fireEvent.click(button);

    await wait();

    const renderCount = screen.getByTestId('renderCount');
    expect(renderCount).toHaveTextContent(/^1$/);

    const fooValue = screen.getByTestId('fooValue');
    expect(fooValue).toHaveTextContent(/^bar$/);

    const input = getByName('foo');

    fireEvent.change(input, {target: {value: 'bar'}});

    await wait();

    expect(renderCount).toHaveTextContent(/^1$/);
    expect(fooValue).toHaveTextContent(/^bar$/);
  });

  test('should update form value', async () => {
    const {render} = rendererWith();

    const {getByName} = render(<UseFormValuesTestComponent />);

    const input = getByName('foo');

    fireEvent.change(input, {target: {value: 'ipsum'}});

    await wait();

    const renderCount = screen.getByTestId('renderCount');
    expect(renderCount).toHaveTextContent(/^2$/);

    const fooValue = screen.getByTestId('fooValue');
    expect(fooValue).toHaveTextContent(/^ipsum$/);
  });
});
