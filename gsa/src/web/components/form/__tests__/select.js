/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import {
  render,
  fireEvent,
  queryAllByTestId,
  getByTestId,
} from 'web/utils/testing';

import Select from '../select.js';

const openSelectElement = element => {
  const openButton = getByTestId(element, 'select-open-button');
  fireEvent.click(openButton);
};

const getItemElements = baseElement => {
  const portal = baseElement.querySelector('#portals');
  return queryAllByTestId(portal, 'select-item');
};

const getInputBox = baseElement => {
  const portal = baseElement.querySelector('#portals');
  return portal.querySelector('[role="combobox"]');
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
