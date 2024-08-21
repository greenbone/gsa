/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Date from 'gmp/models/date';

import {render, fireEvent} from 'web/utils/testing';

import StartTimeSelection from '../startendtimeselection';

describe('StartTimeSelection tests', () => {
  test('should render', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);

    const handleChange = testing.fn();

    const {element} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    expect(element).toBeVisible();
  });

  test('should display timezone', () => {
    const timezone = 'CET';
    const startDate = Date('2019-01-01T12:00Z').tz(timezone);
    const endDate = Date('2019-01-01T13:00Z').tz(timezone);

    const handleChange = testing.fn();

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

    const handleChange = testing.fn();

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

    const handleChange = testing.fn();

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

    const handleChange = testing.fn();

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

    const handleChange = testing.fn();

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
