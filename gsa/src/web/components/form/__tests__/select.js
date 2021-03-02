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

import {setLocale} from 'gmp/locale/lang';

import {
  render,
  fireEvent,
  queryAllByTestId,
  getByTestId,
} from 'web/utils/testing';

import Select from '../select';

setLocale('en');

export const openSelectElement = element => {
  const openButton = getByTestId(element, 'select-open-button');
  fireEvent.click(openButton);
};

export const getItemElements = baseElement => {
  const portal = baseElement.querySelector('#portals');
  return queryAllByTestId(portal, 'select-item');
};

export const getInputBox = baseElement => {
  const portal = baseElement.querySelector('#portals');
  return getByTestId(portal, 'select-search-input');
};

describe('Select component tests', () => {
  test('should render', () => {
    const {element} = render(<Select />);

    expect(element).toMatchSnapshot();
  });

  test('should render with items', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];
    const {element, baseElement} = render(<Select items={items} />);

    let domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(0);

    openSelectElement(element);

    domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(2);
    expect(domItems[0]).toHaveTextContent('Bar');
    expect(domItems[1]).toHaveTextContent('Foo');
  });

  test('should render loading', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    const {element, baseElement} = render(
      <Select items={items} isLoading={true} />,
    );

    expect(element).toHaveTextContent('Loading...');

    let domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(0);

    openSelectElement(element);

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(0);
  });

  test('should render invalid state', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    const {element} = render(<Select hsaError={true} items={items} />);

    expect(element).toHaveTextContent('×');
    expect(element).toHaveStyleRule('background-color: #f2dede');
  });

  test('should call onChange handler', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const onChange = jest.fn();

    const {element, baseElement} = render(
      <Select items={items} onChange={onChange} />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(2);

    fireEvent.click(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('bar', undefined);
  });

  test('should call onChange handler with name', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const onChange = jest.fn();

    const {element, baseElement} = render(
      <Select name="abc" items={items} onChange={onChange} />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('bar', 'abc');
  });

  test('should change value', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const onChange = jest.fn();

    // eslint-disable-next-line no-shadow
    const {baseElement, element, getByTestId} = render(
      <Select items={items} value="bar" onChange={onChange} />,
    );

    const displayedValue = getByTestId('select-selected-value');
    expect(displayedValue).toHaveTextContent('Bar');

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[1]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('foo', undefined);
  });

  test('should filter items', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'bat',
        label: 'Bat',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const {element, baseElement} = render(<Select items={items} value="bar" />);

    openSelectElement(element);

    let domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(3);

    const input = getInputBox(baseElement);

    fireEvent.change(input, {target: {value: 'ba'}});

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(2);

    fireEvent.change(input, {target: {value: 'F'}});

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(1);
  });
});

// vim: set ts=2 sw=2 tw=80:
