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

import CreateNamedFilterGroup from '../createnamedfiltergroup';

describe('CreateNamedFilterGroup tests', () => {
  test('should render', () => {
    const handleChangeMock = jest.fn();
    const {element} = render(
      <CreateNamedFilterGroup onValueChange={handleChangeMock} />,
    );

    expect(element).toHaveStyleRule('display', 'flex');
    expect(element).toHaveStyleRule('margin-top', '15px');
    expect(element).toMatchSnapshot();
  });

  test('should check checkbox and enable textfield correctly', () => {
    const handleChangeMock = jest.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={true}
        onValueChange={handleChangeMock}
      />,
    );
    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    const textfield = getByTestId('createnamedfiltergroup-textfield');

    expect(checkbox.checked).toEqual(true);
    expect(textfield.disabled).toEqual(false);
  });

  test('should uncheck checkbox and disable textfield correctly', () => {
    const handleChangeMock = jest.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        onValueChange={handleChangeMock}
      />,
    );
    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    const textfield = getByTestId('createnamedfiltergroup-textfield');

    expect(checkbox.checked).toEqual(false);
    expect(textfield.disabled).toEqual(true);
  });

  test('should uncheck checkbox if saveNamedFilter is undefined', () => {
    const handleChangeMock = jest.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup onValueChange={handleChangeMock} />,
    );
    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    expect(checkbox.checked).toEqual(false);
  });

  test('should call change handler of checkbox for "unchecking"', () => {
    const handleChangeMock = jest.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={true}
        onValueChange={handleChangeMock}
      />,
    );

    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    fireEvent.click(checkbox);

    expect(handleChangeMock).toHaveBeenCalledWith(false, 'saveNamedFilter');
  });

  test('should call change handler of checkbox for "checking"', () => {
    const handleChangeMock = jest.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        onValueChange={handleChangeMock}
      />,
    );

    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    fireEvent.click(checkbox);

    expect(handleChangeMock).toHaveBeenCalledWith(true, 'saveNamedFilter');
  });

  test('should call change handler of textfield with value and name', () => {
    const handleChangeMock = jest.fn();

    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={true}
        filterName={'foo'}
        onValueChange={handleChangeMock}
      />,
    );

    const textField = getByTestId('createnamedfiltergroup-textfield');
    fireEvent.change(textField, {target: {value: 'bar'}});

    expect(handleChangeMock).toHaveBeenCalledWith('bar', 'filterName');
  });

  test('textfield should not change value when disabled', () => {
    const handleChangeMock = jest.fn();

    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        filterName={'foo'}
        onValueChange={handleChangeMock}
      />,
    );

    const textField = getByTestId('createnamedfiltergroup-textfield');
    fireEvent.change(textField, {target: {value: 'bar'}});

    expect(handleChangeMock).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
