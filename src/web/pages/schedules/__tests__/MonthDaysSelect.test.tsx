/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import MonthDaysSelect from 'web/pages/schedules/MonthDaysSelect';
import Theme from 'web/utils/Theme';

describe('MonthDaysSelect', () => {
  test('should render day buttons 1 through 28', () => {
    render(
      <MonthDaysSelect name="monthdays" value={[1]} onChange={testing.fn()} />,
    );

    for (let day = 1; day <= 28; day++) {
      screen.getByText(String(day));
    }
  });

  test('should render extra day buttons 29, 30, 31 and Last Day', () => {
    render(
      <MonthDaysSelect name="monthdays" value={[1]} onChange={testing.fn()} />,
    );

    screen.getByText('29');
    screen.getByText('30');
    screen.getByText('31');
    screen.getByText('Last Day');
  });

  test('should mark button as checked when day is in value', () => {
    render(
      <MonthDaysSelect
        name="monthdays"
        value={[5, 15]}
        onChange={testing.fn()}
      />,
    );

    expect(screen.getByText('5')).toHaveBackgroundColor(Theme.lightGreen);
    expect(screen.getByText('15')).toHaveBackgroundColor(Theme.lightGreen);
    expect(screen.getByText('10')).toHaveBackgroundColor(Theme.lightGray);
  });

  test('should call onChange with day added when an unchecked day is clicked', () => {
    const onChange = testing.fn();

    render(
      <MonthDaysSelect name="monthdays" value={[5]} onChange={onChange} />,
    );

    fireEvent.click(screen.getByText('10'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [newValue, name] = onChange.mock.calls[0] as [number[], string];
    expect(newValue).toContain(5);
    expect(newValue).toContain(10);
    expect(name).toBe('monthdays');
  });

  test('should call onChange with day removed when a checked day is clicked', () => {
    const onChange = testing.fn();

    render(
      <MonthDaysSelect name="monthdays" value={[5, 10]} onChange={onChange} />,
    );

    fireEvent.click(screen.getByText('5'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [newValue] = onChange.mock.calls[0] as [number[], string];
    expect(newValue).not.toContain(5);
    expect(newValue).toContain(10);
  });

  test('should not call onChange when trying to deselect the last remaining day', () => {
    const onChange = testing.fn();

    render(
      <MonthDaysSelect name="monthdays" value={[5]} onChange={onChange} />,
    );

    fireEvent.click(screen.getByText('5'));

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should mark Last Day (-1) as checked when -1 is in value', () => {
    render(
      <MonthDaysSelect name="monthdays" value={[-1]} onChange={testing.fn()} />,
    );

    expect(screen.getByText('Last Day')).toHaveBackgroundColor(
      Theme.lightGreen,
    );
  });

  test('should not call onChange when disabled and a button is clicked', () => {
    const onChange = testing.fn();

    render(
      <MonthDaysSelect
        disabled
        name="monthdays"
        value={[1]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('1'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
