/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {WeekDays} from 'gmp/models/event';
import WeekDaySelect from 'web/pages/schedules/WeekdaySelect';
import Theme from 'web/utils/Theme';

describe('WeekDaySelect', () => {
  test('should render all 7 day toggle buttons', () => {
    const value = new WeekDays({monday: true});

    render(
      <WeekDaySelect name="weekdays" value={value} onChange={testing.fn()} />,
    );

    screen.getByTitle('Monday');
    screen.getByTitle('Tuesday');
    screen.getByTitle('Wednesday');
    screen.getByTitle('Thursday');
    screen.getByTitle('Friday');
    screen.getByTitle('Saturday');
    screen.getByTitle('Sunday');
  });

  test('should reflect checked state for selected days', () => {
    const value = new WeekDays({monday: true, friday: true});

    render(
      <WeekDaySelect name="weekdays" value={value} onChange={testing.fn()} />,
    );

    expect(screen.getByTitle('Monday')).toHaveBackgroundColor(Theme.lightGreen);
    expect(screen.getByTitle('Friday')).toHaveBackgroundColor(Theme.lightGreen);
    expect(screen.getByTitle('Tuesday')).toHaveBackgroundColor(Theme.lightGray);
  });

  test('should call onChange with updated WeekDays when a day is toggled on', () => {
    const onChange = testing.fn();
    const value = new WeekDays({monday: true});

    render(<WeekDaySelect name="weekdays" value={value} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Wednesday'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [newValue, name] = onChange.mock.calls[0] as [WeekDays, string];
    expect(newValue).toBeInstanceOf(WeekDays);
    expect(newValue.wednesday).toBeTruthy();
    expect(name).toBe('weekdays');
  });

  test('should call onChange when a day is toggled off (while another remains)', () => {
    const onChange = testing.fn();
    const value = new WeekDays({monday: true, tuesday: true});

    render(<WeekDaySelect name="weekdays" value={value} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Monday'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [newValue] = onChange.mock.calls[0] as [WeekDays, string];
    expect(newValue.monday).toBeFalsy();
    expect(newValue.tuesday).toBeTruthy();
  });

  test('should not call onChange when trying to deselect the last selected day', () => {
    const onChange = testing.fn();
    const value = new WeekDays({monday: true});

    render(<WeekDaySelect name="weekdays" value={value} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Monday'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
