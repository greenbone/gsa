/* Copyright (C) 2021 Greenbone Networks GmbH
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
import React, {useRef} from 'react';

import {fireEvent, rendererWith, wait, screen} from 'web/utils/testing';

import TextField from '../textfield';

import useFormValues from '../useFormValues';

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
      <TextField name="foo" onChange={handleValueChange} value={values.foo} />
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
