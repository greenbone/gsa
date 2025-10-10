/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, changeInputValue} from 'web/testing';
import NumberField from 'web/components/form/NumberField';

describe('NumberField tests', () => {
  test('should render', () => {
    render(<NumberField data-testid="input" value={1} />);

    const element = screen.getByTestId('input');

    expect(element).toHaveValue('1');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    changeInputValue(element, '2');

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveValue('2');
  });

  test('should call change handler for characters with empty string', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    changeInputValue(element, 'ABC');

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveValue('');
  });

  test('should allow to clear input', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    changeInputValue(element, '');

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveValue('');
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();
    render(
      <NumberField
        data-testid="input"
        name="foo"
        value={1}
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    changeInputValue(element, '2');

    expect(onChange).toHaveBeenCalledWith(2, 'foo');
    expect(element).toHaveValue('2');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    render(
      <NumberField
        data-testid="input"
        disabled={true}
        value={1}
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');
    expect(element).toBeDisabled();
    expect(element).toHaveValue('1');
    changeInputValue(element, '2');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should update value', () => {
    const onChange = testing.fn();
    const {rerender} = render(
      <NumberField data-testid="input" value={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    changeInputValue(element, '2');

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveValue('2');

    rerender(<NumberField data-testid="input" value={2} onChange={onChange} />);

    expect(element).toHaveValue('2');

    rerender(<NumberField data-testid="input" value={3} onChange={onChange} />);

    expect(element).toHaveValue('3');
  });
});
