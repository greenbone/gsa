/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import DaySelect from 'web/pages/schedules/DaySelect';

describe('DaySelect', () => {
  test.each([
    {value: 'monday', label: 'Monday'},
    {value: 'tuesday', label: 'Tuesday'},
    {value: 'wednesday', label: 'Wednesday'},
    {value: 'thursday', label: 'Thursday'},
    {value: 'friday', label: 'Friday'},
    {value: 'saturday', label: 'Saturday'},
    {value: 'sunday', label: 'Sunday'},
  ] as const)(
    'should show "$label" when value is "$value"',
    ({value, label}) => {
      render(
        <DaySelect name="monthlyDay" value={value} onChange={testing.fn()} />,
      );

      expect(screen.getByTestId('form-select')).toHaveValue(label);
    },
  );

  test('should call onChange when a different day is selected', () => {
    const onChange = testing.fn();

    render(<DaySelect name="monthlyDay" value="monday" onChange={onChange} />);

    const select = screen.getByTestId('form-select');
    fireEvent.click(select);
    fireEvent.click(screen.getByRole('option', {name: 'Friday'}));

    expect(onChange).toHaveBeenCalledWith('friday', 'monthlyDay');
  });
});
