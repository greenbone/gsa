/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import PasswordField from 'web/components/form/PasswordField';
import {render, fireEvent, screen} from 'web/testing';

describe('PasswordField tests', () => {
  test('should render', () => {
    render(<PasswordField data-testid="input" />);

    const element = screen.getByTestId('input');

    // ensure type is password to NOT SHOW plain text
    expect(element).toHaveAttribute('type', 'password');
    expect(element).toBeInTheDocument();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    render(
      <PasswordField data-testid="input" value="foo" onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    render(
      <PasswordField
        data-testid="input"
        name="foo"
        value="ipsum"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(
      <PasswordField
        data-testid="input"
        disabled={true}
        value="foo"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should allow to clear input', () => {
    const onChange = testing.fn();

    render(
      <PasswordField data-testid="input" value="abc" onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
  });
});
