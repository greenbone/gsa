/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import PasswordField from '../passwordfield';

describe('PasswordField tests', () => {
  test('should render', () => {
    const {element} = render(<PasswordField />);

    // ensure type is password to NOT SHOW plain text
    expect(element).toHaveAttribute('type', 'password');

    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<PasswordField disabled={true} />);
    expect(element).toMatchSnapshot();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    const {element} = render(<PasswordField value="foo" onChange={onChange} />);

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    const {element} = render(
      <PasswordField name="foo" value="ipsum" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    const {element} = render(
      <PasswordField disabled={true} value="foo" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
