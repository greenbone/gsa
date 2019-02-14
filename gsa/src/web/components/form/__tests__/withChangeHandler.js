/* Copyright (C) 2018 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';

import withChangeHandler from '../withChangeHandler';

describe('withChangeHandlerTests', () => {
  test('should call change handler with value', () => {
    const Component = withChangeHandler()(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(<Component value="bar" onChange={onChange} />);

    fireEvent.change(element, {target: {value: 'foo'}});

    expect(onChange).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call change handler with value and name', () => {
    const Component = withChangeHandler()(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(
      <Component name="bar" value="bar" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'foo'}});

    expect(onChange).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should call change handler with converted value', () => {
    const Component = withChangeHandler()(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(
      <Component
        name="bar"
        value={1}
        convert={v => v * 2}
        onChange={onChange}
      />,
    );

    fireEvent.change(element, {target: {value: 2}});

    expect(onChange).toHaveBeenCalledWith(4, 'bar');
  });

  test('should allow to set a pre-defined convert function', () => {
    const Component = withChangeHandler({
      convert_func: v => v * 2,
    })(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(
      <Component name="bar" value={0} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 2}});

    expect(onChange).toHaveBeenCalledWith(4, 'bar');
  });

  test('should allow to set a pre-defined value function', () => {
    const Component = withChangeHandler({
      value_func: (event, props) => props.foo,
    })(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(
      <Component name="bar" foo={42} value={0} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'foo'}});

    expect(onChange).toHaveBeenCalledWith(42, 'bar');
  });

  test('should not call change handler if disabled', () => {
    const Component = withChangeHandler()(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(
      <Component name="bar" value="bar" disabled={true} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'foo'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should allow to set a debounce delay', () => {
    jest.useFakeTimers();

    const Component = withChangeHandler()(props => <input {...props} />);

    const onChange = jest.fn();
    const {element} = render(
      <Component name="bar" value={0} debounce={500} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 1}});
    fireEvent.change(element, {target: {value: 2}});
    fireEvent.change(element, {target: {value: 3}});

    jest.runAllTimers();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('3', 'bar');
  });

  test('should set value on component', () => {
    const Component = withChangeHandler()(props => <input {...props} />);

    const {rerender, element} = render(<Component name="bar" value="foo" />);

    expect(element).toHaveAttribute('value', 'foo');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(element).toHaveAttribute('value', 'bar');

    rerender(<Component name="bar" value="foobar" />);

    expect(element).toHaveAttribute('value', 'foobar');
  });
});

// vim: set ts=2 sw=2 tw=80:
