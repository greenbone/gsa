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

import SeverityLevelsFilterGroup from '../severitylevelsgroup';

import Filter from 'gmp/models/filter';

describe('SeverityLevelsFilterGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('levels=h');
    const handleChange = jest.fn();
    const handleRemove = jest.fn();
    const {element} = render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('levels=');
    const handleChange = jest.fn();
    const handleRemove = jest.fn();
    const {element} = render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');
    fireEvent.click(checkbox[0]);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('h', 'levels');
  });

  test('should check checkbox', () => {
    const filter = Filter.fromString('levels=hm');
    const handleChange = jest.fn();
    const handleRemove = jest.fn();
    const {element} = render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);
  });

  test('should uncheck checkbox', () => {
    const filter1 = Filter.fromString('levels=hm');
    const filter2 = Filter.fromString('levels=m');
    const handleChange = jest.fn();
    const handleRemove = jest.fn();
    const {element, rerender} = render(
      <SeverityLevelsFilterGroup
        filter={filter1}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(true);
    expect(checkbox[1].checked).toEqual(true);

    rerender(
      <SeverityLevelsFilterGroup
        filter={filter2}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(checkbox[0].checked).toEqual(false);
    expect(checkbox[1].checked).toEqual(true);
  });

  test('should be unchecked by default', () => {
    const filter = Filter.fromString();
    const handleChange = jest.fn();
    const handleRemove = jest.fn();
    const {element} = render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');

    expect(checkbox[0].checked).toEqual(false);
    expect(checkbox[1].checked).toEqual(false);
    expect(checkbox[2].checked).toEqual(false);
    expect(checkbox[3].checked).toEqual(false);
    expect(checkbox[4].checked).toEqual(false);
  });

  test('should call remove handler', () => {
    const filter = Filter.fromString('levels=h');
    const handleChange = jest.fn();
    const handleRemove = jest.fn();
    const {element} = render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = element.querySelectorAll('input');
    expect(checkbox[0].checked).toEqual(true);

    fireEvent.click(checkbox[0]);

    expect(handleRemove).toHaveBeenCalled();
  });
});
