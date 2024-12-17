/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {useState} from 'react';
import {fireEvent, render, screen} from 'web/utils/testing';

import usePreviousValue from '../usePreviousValue';

const TestComponent = () => {
  const [value, setValue] = useState(0);
  const previousValue = usePreviousValue(value);
  return (
    <>
      <button onClick={() => setValue(1)}></button>
      <span data-testid="value">{value}</span>
      <span data-testid="previousValue">{'' + previousValue}</span>
    </>
  );
};

describe('usePreviousValue', () => {
  test('should return the previous value', () => {
    render(<TestComponent />);

    const value = screen.getByTestId('value');
    const previousValue = screen.getByTestId('previousValue');

    expect(value).toHaveTextContent('0');
    expect(previousValue).toHaveTextContent('undefined');

    fireEvent.click(screen.getByRole('button'));

    expect(value).toHaveTextContent('1');
    expect(previousValue).toHaveTextContent('0');
  });
});
