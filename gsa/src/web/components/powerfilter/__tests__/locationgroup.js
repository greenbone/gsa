/* Copyright (C) 2019 Greenbone Networks GmbH
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

import LocationGroup from 'web/components/powerfilter/locationgroup';

import Filter from 'gmp/models/filter';

describe('LocationGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('location=general/tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <LocationGroup
        filter={filter}
        name="name"
        loc={'general/tcp'}
        onChange={handleChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render value from filter', () => {
    const filter = Filter.fromString('location=general/tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <LocationGroup filter={filter} name="name" onChange={handleChange} />,
    );
    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', 'general/tcp');
  });

  test('should render value from loc by default', () => {
    const filter = Filter.fromString('location=general/tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <LocationGroup
        filter={filter}
        name="name"
        loc={'foo'}
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', 'foo');
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('location=general/tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <LocationGroup
        filter={filter}
        name="name"
        loc={'bar'}
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: 'abc'}});

    expect(handleChange).toHaveBeenCalledWith('abc', 'name');
  });
});
