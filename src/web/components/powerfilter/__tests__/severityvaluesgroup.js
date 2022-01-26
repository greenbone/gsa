/* Copyright (C) 2019-2022 Greenbone Networks GmbH
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
} from 'web/components/form/__tests__/select';

import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';

import Filter from 'gmp/models/filter';

describe('Severity Values Group Tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('severity>3');
    const name = 'severity';
    const onChange = jest.fn();

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('arguments are processed correctly', () => {
    const onChange = jest.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const formTitle = element.querySelectorAll('label');
    const numField = element.querySelectorAll('input');

    expect(formTitle[0]).toHaveTextContent('foo');
    expect(numField[0]).toHaveAttribute('name', 'severity');
    expect(numField[0]).toHaveAttribute('value', '3');
  });

  test('should initialize value with 0 in case no filter value is given', () => {
    const onChange = jest.fn();
    const filter = Filter.fromString('rows=10');
    const name = 'severity';

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = element.querySelectorAll('input');

    expect(numField[0]).toHaveAttribute('name', 'severity');
    expect(numField[0]).toHaveAttribute('value', '0');
  });

  test('should change value', () => {
    const onChange = jest.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = element.querySelectorAll('input');

    fireEvent.change(numField[0], {target: {value: '9'}});

    expect(onChange).toHaveBeenCalledWith(9, 'severity', '=');
  });

  test('should change relationship', () => {
    const onChange = jest.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {element, baseElement} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[3]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(3, 'severity', '<');
  });
});
