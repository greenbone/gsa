/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, screen, fireEvent} from 'web/utils/testing';

import useValueChange from '../useValueChange';

// eslint-disable-next-line react/prop-types
const TestComponent = ({value, onChange, name, disabled}) => {
  const handleChange = useValueChange({onChange, name, disabled});

  return (
    <input value={value} name={name} type="text" onChange={handleChange} />
  );
};

describe('onValueChange Tests', () => {
  test('should call onChange when value changes', () => {
    const onChange = testing.fn();

    render(<TestComponent value="test" onChange={onChange} name="test" />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, {target: {value: 'new value'}});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('new value', 'test');
  });

  test('should not call onChange when disabled', () => {
    const onChange = testing.fn();

    render(
      <TestComponent
        value="test"
        onChange={onChange}
        name="test"
        disabled={true}
      />,
    );

    const input = screen.getByRole('textbox');

    fireEvent.change(input, {target: {value: 'new value'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
