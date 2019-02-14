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

import Button from '../button';

describe('Button tests', () => {
  test('should call click handler', () => {
    const handler = jest.fn();

    const {element} = render(<Button onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should call click handler with value', () => {
    const handler = jest.fn();

    const {element} = render(<Button onClick={handler} value="bar" />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call click handler with value and name', () => {
    const handler = jest.fn();

    const {element} = render(
      <Button name="foo" value="bar" onClick={handler} />,
    );

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should render button', () => {
    const {element} = render(<Button />);

    expect(element).toMatchSnapshot();
  });

  test('should render title', () => {
    const {element} = render(<Button title="foo" />);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('foo');
  });

  test('should render title and children', () => {
    const {element} = render(<Button title="foo">bar</Button>);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('bar');
  });
});

// vim: set ts=2 sw=2 tw=80:
