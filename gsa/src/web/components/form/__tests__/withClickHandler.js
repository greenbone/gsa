/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';

import withClickHandler from '../withClickHandler';

/* eslint-disable react/prop-types */

const TestInput = ({value, ...props}) => <input {...props} type="text" />;

describe('withClickHandler tests', () => {
  test('should call click handler with value', () => {
    const Component = withClickHandler()(TestInput);

    const onClick = jest.fn();
    const {element} = render(<Component value="foo" onClick={onClick} />);

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call click handler with value and name', () => {
    const Component = withClickHandler()(TestInput);

    const onClick = jest.fn();
    const {element} = render(
      <Component name="bar" value="foo" onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should call click handler with converted value', () => {
    const Component = withClickHandler()(TestInput);

    const onClick = jest.fn();
    const {element} = render(
      <Component convert={v => v * 2} value={21} onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith(42, undefined);
  });

  test('should allow to set a pre-defined convert function', () => {
    const Component = withClickHandler({
      convert_func: v => v * 2,
    })(TestInput);

    const onClick = jest.fn();
    const {element} = render(<Component value={21} onClick={onClick} />);

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith(42, undefined);
  });

  test('should allow to set a pre-defined value function', () => {
    const Component = withClickHandler({
      value_func: (event, props) => props.foo,
    })(TestInput);

    const onClick = jest.fn();
    const {element} = render(
      <Component foo="bar" value={21} onClick={onClick} />,
    );

    fireEvent.click(element);

    expect(onClick).toHaveBeenCalledWith('bar', undefined);
  });
});
