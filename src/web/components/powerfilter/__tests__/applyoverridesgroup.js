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

import ApplyOverridesGroup from '../applyoverridesgroup';

import Filter from 'gmp/models/filter';

describe('ApplyOverridesGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString();
    const handleChange = jest.fn();
    const {element} = render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('apply_overrides=1');
    const handleChange = jest.fn();
    const {getAllByTestId} = render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getAllByTestId('radio-input');
    fireEvent.click(radio[1]);

    expect(handleChange).toHaveBeenCalledWith(0, 'applyOverrides');
  });

  test('should check radio', () => {
    const filter = Filter.fromString('apply_overrides=1');
    const handleChange = jest.fn();
    const {getAllByTestId} = render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getAllByTestId('radio-input');

    expect(radio[0].checked).toEqual(true);
  });

  test('should uncheck radio of previous choice', () => {
    const filter1 = Filter.fromString('apply_overrides=1');
    const filter2 = Filter.fromString('apply_overrides=0');
    const handleChange = jest.fn();
    const {getAllByTestId, rerender} = render(
      <ApplyOverridesGroup
        filter={filter1}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getAllByTestId('radio-input');

    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);

    rerender(
      <ApplyOverridesGroup
        filter={filter2}
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);
  });

  test('should use filter value by default', () => {
    const filter = Filter.fromString('apply_overrides=1');
    const handleChange = jest.fn();
    const {getAllByTestId} = render(
      <ApplyOverridesGroup
        filter={filter}
        name="applyOverrides"
        overrides={0}
        onChange={handleChange}
      />,
    );

    const radio = getAllByTestId('radio-input');
    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);
  });

  test('should use overrides', () => {
    const handleChange = jest.fn();
    const {getAllByTestId} = render(
      <ApplyOverridesGroup
        name="applyOverrides"
        overrides={1}
        onChange={handleChange}
      />,
    );

    const radio = getAllByTestId('radio-input');
    expect(radio[0].checked).toEqual(true);
  });
});
