/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

import Filter from 'gmp/models/filter';

describe('FilterSearchGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('location=tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <FilterSearchGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render value from filter', () => {
    const filter = Filter.fromString('location=tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <FilterSearchGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );
    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', 'tcp');
  });
  test('should call change handler', () => {
    const filter = Filter.fromString('location=tcp');
    const handleChange = jest.fn();
    const {element} = render(
      <FilterSearchGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: 'general'}});

    expect(handleChange).toHaveBeenCalledWith('general', 'location');
  });
});
