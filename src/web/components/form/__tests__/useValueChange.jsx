/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {render, screen, fireEvent} from 'web/utils/testing';

import useValueChange from '../useValueChange';

const TestComponent = ({value, onChange, name, disabled}) => {
  const handleChange = useValueChange({onChange, name, disabled});

  return (
    <input value={value} name={name} type="text" onChange={handleChange} />
  );
};

describe('onValueChange Tests', () => {
  test('should call onChange when value changes', () => {
    const onChange = jest.fn();

    render(<TestComponent value="test" onChange={onChange} name="test" />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, {target: {value: 'new value'}});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('new value', 'test');
  });

  test('should not call onChange when disabled', () => {
    const onChange = jest.fn();

    render(<TestComponent value="test" onChange={onChange} name="test" disabled={true}/>);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, {target: {value: 'new value'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
