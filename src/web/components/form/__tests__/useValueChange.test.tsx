/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import useValueChange from 'web/components/form/useValueChange';

interface TestComponentProps {
  value: string;
  onChange: (value: string, name?: string) => void;
  name?: string;
  disabled?: boolean;
}

const TestComponent = ({
  value,
  onChange,
  name,
  disabled,
}: TestComponentProps) => {
  const handleChange = useValueChange({onChange, name, disabled});

  return (
    <input name={name} type="text" value={value} onChange={handleChange} />
  );
};

describe('onValueChange Tests', () => {
  test('should call onChange when value changes', () => {
    const onChange = testing.fn();

    render(<TestComponent name="test" value="test" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, {target: {value: 'new value'}});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('new value', 'test');
  });

  test('should not call onChange when disabled', () => {
    const onChange = testing.fn();

    render(
      <TestComponent
        disabled={true}
        name="test"
        value="test"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('textbox');

    fireEvent.change(input, {target: {value: 'new value'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
