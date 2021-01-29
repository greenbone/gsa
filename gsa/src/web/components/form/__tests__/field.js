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

import Theme from 'web/utils/theme';
import {render, fireEvent} from 'web/utils/testing';

import Field, {DISABLED_OPACITY} from '../field';

describe('Field tests', () => {
  test('should render', () => {
    const {element} = render(<Field />);

    expect(element).not.toHaveStyleRule('cursor');
    expect(element).not.toHaveStyleRule('opacity');
    expect(element).toHaveStyleRule('background-color', Theme.white);

    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<Field disabled={true} />);

    expect(element).toHaveStyleRule('cursor', 'not-allowed');
    expect(element).toHaveStyleRule('opacity', `${DISABLED_OPACITY}`);
    expect(element).toHaveStyleRule('background-color', Theme.dialogGray);

    expect(element).toMatchSnapshot();
  });

  test('should call change handler with value', () => {
    const onChange = jest.fn();

    const {element} = render(<Field value="foo" onChange={onChange} />);

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = jest.fn();

    const {element} = render(
      <Field name="foo" value="ipsum" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = jest.fn();

    const {element} = render(
      <Field disabled={true} value="foo" onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
