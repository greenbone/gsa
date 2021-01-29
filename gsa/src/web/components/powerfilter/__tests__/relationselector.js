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

import {
  openSelectElement,
  getItemElements,
  getInputBox,
} from 'web/components/form/__tests__/select';

import RelationSelector from 'web/components/powerfilter/relationselector';

describe('Relation Selector Tests', () => {
  test('should render', () => {
    const onChange = jest.fn();
    const {element} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should return items', () => {
    const onChange = jest.fn();
    const {element, baseElement} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    let domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(0);

    openSelectElement(element);

    domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(3);
    expect(domItems[0]).toHaveTextContent('is equal to');
    expect(domItems[1]).toHaveTextContent('is greater than');
    expect(domItems[2]).toHaveTextContent('is less than');
  });

  test('should call onChange handler', () => {
    const onChange = jest.fn();

    const {element, baseElement} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('=', undefined);
  });
  test('should change value', () => {
    const onChange = jest.fn();

    // eslint-disable-next-line no-shadow
    const {baseElement, element, getByTestId} = render(
      <RelationSelector relation="=" onChange={onChange} />,
    );

    const displayedValue = getByTestId('select-selected-value');
    expect(displayedValue).toHaveTextContent('is equal to');

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[2]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('<', undefined);
  });

  test('should filter items', () => {
    const onChange = jest.fn();
    const {element, baseElement} = render(
      <RelationSelector relation="=" onChange={onChange} />,
    );
    openSelectElement(element);

    let domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(3);

    const input = getInputBox(baseElement);

    fireEvent.change(input, {target: {value: 'than'}});

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(2);

    fireEvent.change(input, {target: {value: 'to'}});

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(1);
  });
});
