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

import {DISABLED_OPACTIY} from '../field';
import TextArea from '../textarea';

describe('TextArea tests', () => {
  test('should render', () => {
    const {element} = render(<TextArea />);

    expect(element).not.toHaveStyleRule('cursor');
    expect(element).not.toHaveStyleRule('opacity');
    expect(element).toHaveStyleRule('background-color', Theme.white);

    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<TextArea disabled={true} />);

    expect(element).toHaveStyleRule('cursor', 'not-allowed');
    expect(element).toHaveStyleRule('opacity', `${DISABLED_OPACTIY}`);
    expect(element).toHaveStyleRule('background-color', Theme.dialogGray);

    expect(element).toMatchSnapshot();
  });

  test('should call change handler with value', () => {
    const onChange = jest.fn();

    const {element} = render(<TextArea value="foo" onChange={onChange} />);

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = jest.fn();

    const {element} = render(
      <TextArea name="foo" value="ipsum" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = jest.fn();

    const {element} = render(
      <TextArea disabled={true} value="foo" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
