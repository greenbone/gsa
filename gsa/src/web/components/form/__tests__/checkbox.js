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

import CheckBox from '../checkbox';

describe('CheckBox component tests', () => {

  test('should call change handler', () => {
    const change = jest.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        checked={false}
        onChange={change}
      />
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).toHaveBeenCalledWith(true, 'foo');
  });

  test('should use checkedValue', () => {
    const change = jest.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        checked={false}
        checkedValue="ipsum"
        unCheckedValue="lorem"
        onChange={change}
      />
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).toHaveBeenCalledWith('ipsum', 'foo');
  });

  test('should use unCheckedValue', () => {
    const change = jest.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        checked={true}
        checkedValue="ipsum"
        unCheckedValue="lorem"
        onChange={change}
      />
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).toHaveBeenCalledWith('lorem', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const change = jest.fn();
    const {element} = render(
      <CheckBox
        name="foo"
        disabled={true}
        checked={true}
        checkedValue="ipsum"
        unCheckedValue="lorem"
        onChange={change}
      />
    );

    const input = element.querySelector('input');

    fireEvent.click(input);

    expect(change).not.toHaveBeenCalled();
  });
});
