/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import TextField from 'web/components/form/TextField';
import {render, fireEvent, screen} from 'web/testing';

describe('TextField tests', () => {
  test('should render', () => {
    const {element} = render(<TextField />);

    expect(element).toBeInTheDocument();
  });

  test('should render invalid state', () => {
    render(<TextField errorContent="Some Error" />);

    expect(screen.getByText('Some Error')).toBeVisible();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    render(<TextField value="foo" onChange={onChange} />);

    const element = screen.getByTestId('form-input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    render(<TextField name="foo" value="ipsum" onChange={onChange} />);

    const element = screen.getByTestId('form-input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(<TextField disabled={true} value="foo" onChange={onChange} />);

    const element = screen.getByTestId('form-input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should allow to set a convert function', () => {
    const onChange = testing.fn();
    const convert = value => value.toUpperCase();

    render(<TextField convert={convert} value="foo" onChange={onChange} />);

    const element = screen.getByTestId('form-input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('BAR', undefined);
  });
});
