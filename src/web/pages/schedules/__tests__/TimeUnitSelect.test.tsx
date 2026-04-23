/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {RecurrenceFrequency} from 'gmp/models/event';
import TimeUnitSelect from 'web/pages/schedules/TimeUnitSelect';

describe('TimeUnitSelect', () => {
  test.each([
    {value: RecurrenceFrequency.HOURLY, label: 'hour(s)'},
    {value: RecurrenceFrequency.DAILY, label: 'day(s)'},
    {value: RecurrenceFrequency.WEEKLY, label: 'week(s)'},
    {value: RecurrenceFrequency.MONTHLY, label: 'month(s)'},
    {value: RecurrenceFrequency.YEARLY, label: 'year(s)'},
  ] as const)(
    'should render with "$label" label when value is "$value"',
    ({value, label}) => {
      render(
        <TimeUnitSelect name="freq" value={value} onChange={testing.fn()} />,
      );

      expect(screen.getByTestId('form-select')).toHaveValue(label);
    },
  );

  test('should call onChange when a new value is selected', () => {
    const onChange = testing.fn();

    render(
      <TimeUnitSelect
        name="freq"
        value={RecurrenceFrequency.HOURLY}
        onChange={onChange}
      />,
    );

    const select = screen.getByTestId('form-select');
    fireEvent.click(select);
    fireEvent.click(screen.getByRole('option', {name: 'day(s)'}));

    expect(onChange).toHaveBeenCalledWith(RecurrenceFrequency.DAILY, 'freq');
  });
});
