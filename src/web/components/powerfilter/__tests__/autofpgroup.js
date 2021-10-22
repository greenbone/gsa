/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import AutoFpGroup from '../autofpgroup';

import Filter from 'gmp/models/filter';

describe('AutoFpGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('autofp=1');
    const handleChange = jest.fn();
    const {element} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should check checkbox and enable radio buttons correctly', () => {
    const filter = Filter.fromString('autofp=1');
    const handleChange = jest.fn();
    const {element, getAllByTestId} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );
    const input = element.querySelectorAll('input');
    const radio = getAllByTestId('radio-input');

    expect(input[0].checked).toEqual(true);
    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);

    expect(radio[0].disabled).toEqual(false);
    expect(radio[1].disabled).toEqual(false);
  });

  test('should uncheck checkbox and disable radio buttons correctly', () => {
    const filter = Filter.fromString('autofp=0');
    const handleChange = jest.fn();
    const {element, getAllByTestId} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );
    const input = element.querySelectorAll('input');
    const radio = getAllByTestId('radio-input');

    expect(input[0].checked).toEqual(false);
    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(false);

    expect(radio[0].disabled).toEqual(true);
    expect(radio[1].disabled).toEqual(true);
  });

  test('should call change handler of checkbox for "checking"', () => {
    const filter = Filter.fromString('autofp=0');
    const handleChange = jest.fn();
    const {element} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );
    const input = element.querySelectorAll('input');
    fireEvent.click(input[0]);

    expect(handleChange).toHaveBeenCalledWith(1, 'autofp');
  });

  test('should check radio buttons correctly', () => {
    const filter1 = Filter.fromString('autofp=1');
    const filter2 = Filter.fromString('autofp=2');
    const handleChange = jest.fn();
    const {rerender, getAllByTestId} = render(
      <AutoFpGroup filter={filter1} onChange={handleChange} />,
    );

    const radio = getAllByTestId('radio-input');

    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);

    rerender(<AutoFpGroup filter={filter2} onChange={handleChange} />);

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);
  });

  test('should call change handler of checkbox for "unchecking"', () => {
    const filter = Filter.fromString('autofp=1');
    const handleChange = jest.fn();
    const {element} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );
    const input = element.querySelectorAll('input');
    fireEvent.click(input[0]);

    expect(handleChange).toHaveBeenCalledWith(0, 'autofp');
  });

  test('should call change handler of radio button', () => {
    const filter = Filter.fromString('autofp=1');
    const handleChange = jest.fn();
    const {getAllByTestId} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );
    const radio = getAllByTestId('radio-input');
    fireEvent.click(radio[1]);

    expect(handleChange).toHaveBeenCalledWith(2, 'autofp');
  });

  test('radio buttons should not change when disabled', () => {
    const filter = Filter.fromString('autofp=0');
    const handleChange = jest.fn();
    const {getAllByTestId} = render(
      <AutoFpGroup filter={filter} onChange={handleChange} />,
    );
    const radio = getAllByTestId('radio-input');
    fireEvent.click(radio[1]);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
