/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/date';

import Date from 'gmp/models/date';

import {render, fireEvent} from 'web/utils/testing';

import StartTimeSelection from '../startendtimeselection';

setLocale('en');

describe('StartTimeSelection tests', () => {
  test('should render', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);

    const handleChange = jest.fn();

    const {element} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should display timezone', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);

    const handleChange = jest.fn();

    const {getByTestId} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    const elem = getByTestId('timezone');

    expect(elem).toHaveTextContent(timezone);
  });

  test('should allow to change start time hour', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const newStartDate = Date('2019-01-01T01:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);

    const handleChange = jest.fn();

    const {getByName, getByTestId} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    const input = getByName('startHour');
    fireEvent.change(input, {target: {value: '2'}});

    const button = getByTestId('update-button');
    fireEvent.click(button);

    // eslint-disable-next-line prefer-destructuring
    const args = handleChange.mock.calls[0][0];

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(newStartDate.isSame(args.startDate)).toEqual(true);
    expect(endDate.isSame(args.endDate)).toEqual(true);
  });

  test('should allow to change start time minute', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const newStartDate = Date('2019-01-01T12:10Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);

    const handleChange = jest.fn();

    const {getByName, getByTestId} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    const input = getByName('startMinute');
    fireEvent.change(input, {target: {value: '10'}});

    const button = getByTestId('update-button');
    fireEvent.click(button);

    // eslint-disable-next-line prefer-destructuring
    const args = handleChange.mock.calls[0][0];

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(newStartDate.isSame(args.startDate)).toEqual(true);
    expect(endDate.isSame(args.endDate)).toEqual(true);
  });

  test('should allow to change end time hour', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);
    const newEndDate = Date('2019-01-01T14:00Z').tz(timezone);

    const handleChange = jest.fn();

    const {getByName, getByTestId} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    const input = getByName('endHour');
    fireEvent.change(input, {target: {value: '15'}});

    const button = getByTestId('update-button');
    fireEvent.click(button);

    // eslint-disable-next-line prefer-destructuring
    const args = handleChange.mock.calls[0][0];

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(startDate.isSame(args.startDate)).toEqual(true);
    expect(newEndDate.isSame(args.endDate)).toEqual(true);
  });

  test('should allow to change end time minute', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);
    const newEndDate = Date('2019-01-01T13:15Z').tz(timezone);

    const handleChange = jest.fn();

    const {getByName, getByTestId} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    const input = getByName('endMinute');
    fireEvent.change(input, {target: {value: '15'}});

    const button = getByTestId('update-button');
    fireEvent.click(button);

    // eslint-disable-next-line prefer-destructuring
    const args = handleChange.mock.calls[0][0];

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(startDate.isSame(args.startDate)).toEqual(true);
    expect(newEndDate.isSame(args.endDate)).toEqual(true);
  });
});
