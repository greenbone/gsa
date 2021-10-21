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
import timezones from 'gmp/timezones';

import {render, fireEvent} from 'web/utils/testing';

import TimezoneSelect from '../timezoneselect';

setLocale('en');

describe('TimezoneSelect tests', () => {
  test('should render', () => {
    const {element, getByTestId} = render(<TimezoneSelect />);

    const selected = getByTestId('select-selected-value');
    expect(selected).toHaveTextContent('Coordinated Universal Time/UTC');

    expect(element).toMatchSnapshot();
  });

  test('should render all timezones in selection', () => {
    const {getByTestId, getAllByTestId} = render(<TimezoneSelect />);

    const button = getByTestId('select-open-button');
    fireEvent.click(button);

    const items = getAllByTestId('select-item');
    expect(items.length).toEqual(timezones.length + 1);
  });

  test('should call onChange handler', () => {
    const handler = jest.fn();
    const {getByTestId, getAllByTestId} = render(
      <TimezoneSelect onChange={handler} />,
    );

    const button = getByTestId('select-open-button');
    fireEvent.click(button);

    const items = getAllByTestId('select-item');
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, undefined);
  });

  test('should call onChange handler with name', () => {
    const handler = jest.fn();
    const {getByTestId, getAllByTestId} = render(
      <TimezoneSelect name="foo" onChange={handler} />,
    );

    const button = getByTestId('select-open-button');
    fireEvent.click(button);

    const items = getAllByTestId('select-item');
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, 'foo');
  });

  test('should render selected value', () => {
    const timezone = timezones[1]; // eslint-disable-line prefer-destructuring
    const {getByTestId} = render(<TimezoneSelect value={timezone.name} />);

    const selected = getByTestId('select-selected-value');
    expect(selected).toHaveTextContent(timezone.name);
  });
});
