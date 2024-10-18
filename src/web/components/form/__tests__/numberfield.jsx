/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen, userEvent} from 'web/utils/testing';

import NumberField from '../numberfield';

describe('NumberField tests', () => {
  test('should render', () => {
    render(<NumberField data-testid="input" value={1} />);

    const element = screen.getByTestId('input');

    expect(element).toHaveAttribute('value', '1');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');
  });

  test('should call change handler for characters with empty string', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'ABC'}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveAttribute('value', '');
  });

  test('should allow to clear input', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveAttribute('value', '');
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

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, 'foo');
    expect(element).toHaveAttribute('value', '2');
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

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should update value', () => {
    const onChange = testing.fn();
    const {rerender} = render(
      <NumberField data-testid="input" value={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');

    rerender(<NumberField data-testid="input" value={2} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '2');

    rerender(<NumberField data-testid="input" value={3} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '3');
  });
});
