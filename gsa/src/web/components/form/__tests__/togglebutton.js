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

import Theme from 'web/utils/theme';
import {render, fireEvent} from 'web/utils/testing';

import ToggleButton from '../togglebutton';

describe('ToggleButton tests', () => {
  test('should render', () => {
    const {element} = render(<ToggleButton />);

    expect(element).toHaveStyleRule('width', '32px');
    expect(element).toHaveStyleRule('cursor', 'pointer');
    expect(element).toHaveStyleRule('color', Theme.darkGray);
    expect(element).toHaveStyleRule('background-color', Theme.lightGray);
    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<ToggleButton disabled={true} />);

    expect(element).toHaveStyleRule('cursor', 'default');
    expect(element).toHaveStyleRule('color', Theme.mediumGray);
    expect(element).toHaveStyleRule('background-color', Theme.lightGray);
  });

  test('should render in checked state', () => {
    const {element} = render(<ToggleButton checked={true} />);

    expect(element).toHaveStyleRule('cursor', 'pointer');
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveStyleRule('background-color', Theme.lightGreen);
  });

  test('should call onToggle handler', () => {
    const handler = jest.fn();
    const {element} = render(<ToggleButton onToggle={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith(true, undefined);
  });

  test('should call onToggle handler with name', () => {
    const handler = jest.fn();
    const {element} = render(<ToggleButton name="foo" onToggle={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith(true, 'foo');
  });

  test('should toggle checked state', () => {
    const handler = jest.fn();
    const {element} = render(
      <ToggleButton name="foo" checked={true} onToggle={handler} />,
    );

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith(false, 'foo');
  });

  test('should not call handler if disabled', () => {
    const handler = jest.fn();
    const {element} = render(
      <ToggleButton disabled={true} onToggle={handler} />,
    );

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });
});
