/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CheckBox from 'web/components/form/Checkbox';
import {render, fireEvent, screen} from 'web/testing';

describe('CheckBox component tests', () => {
  test('should call change handler', () => {
    const change = testing.fn();
    render(
      <CheckBox
        checked={false}
        data-testid="checkbox"
        name="foo"
        onChange={change}
      />,
    );

    const checkbox = screen.getByTestId<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);

    expect(change).toHaveBeenCalledWith(true, 'foo');
  });

  test('should use checkedValue', () => {
    const change = testing.fn();
    render(
      <CheckBox<string>
        checked={false}
        checkedValue="ipsum"
        data-testid="checkbox"
        name="foo"
        unCheckedValue="lorem"
        onChange={change}
      />,
    );

    const checkbox = screen.getByTestId<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);

    expect(change).toHaveBeenCalledWith('ipsum', 'foo');
  });

  test('should use unCheckedValue', () => {
    const change = testing.fn();
    render(
      <CheckBox
        checked={true}
        checkedValue="ipsum"
        data-testid="checkbox"
        name="foo"
        unCheckedValue="lorem"
        onChange={change}
      />,
    );

    const checkbox = screen.getByTestId<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);

    expect(change).toHaveBeenCalledWith('lorem', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const change = testing.fn();
    render(
      <CheckBox
        checked={true}
        checkedValue="ipsum"
        data-testid="checkbox"
        disabled={true}
        name="foo"
        unCheckedValue="lorem"
        onChange={change}
      />,
    );

    const checkbox = screen.getByTestId<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);

    expect(change).not.toHaveBeenCalled();
  });

  test('should render title', () => {
    render(<CheckBox data-testid="checkbox" name="foo" title="bar" />);

    screen.getByTestId('checkbox');
    screen.getByLabelText('bar');
  });

  test('should render default checked state', () => {
    render(<CheckBox data-testid="checkbox" />);
    const checkbox = screen.getByTestId<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(false);
  });
});
