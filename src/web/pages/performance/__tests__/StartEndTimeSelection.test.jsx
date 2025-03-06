/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import MomentDate from 'gmp/models/date';
import StartTimeSelection from 'web/pages/performance/StartEndTimeSelection';
import {render, screen, fireEvent} from 'web/utils/Testing';

const timezone = 'CET';
const startDate = MomentDate('2019-01-01T12:00Z').tz(timezone);
const endDate = MomentDate('2019-02-01T13:00Z').tz(timezone);

const handleChange = testing.fn();

describe('StartTimeSelection tests', () => {
  test('should render correct dates', () => {
    const {element} = render(
      <StartTimeSelection
        endDate={endDate}
        startDate={startDate}
        timezone={timezone}
        onChanged={handleChange}
      />,
    );

    expect(element).toBeVisible();

    const checkElementVisibilityAndContent = (
      labelText,
      inputValue,
      timePickerLabel,
      timePickerValue,
    ) => {
      const label = screen.getByLabelText(labelText);
      expect(label).toBeVisible();

      const input = screen.getByDisplayValue(inputValue);
      expect(input).toBeVisible();
      expect(input).toHaveValue(inputValue);

      const timePicker = screen.getByLabelText(timePickerLabel);
      expect(timePicker).toBeVisible();
      expect(timePicker).toHaveValue(timePickerValue);
    };

    checkElementVisibilityAndContent(
      'Start Date',
      '01/01/2019',
      'Start Time',
      '13:00',
    );
    checkElementVisibilityAndContent(
      'End Date',
      '01/02/2019',
      'End Time',
      '14:00',
    );
  });

  test('should display timezone', () => {
    render(
      <StartTimeSelection
        endDate={endDate}
        startDate={startDate}
        timezone={timezone}
        onChanged={handleChange}
      />,
    );

    const elem = screen.getByTestId('timezone');
    expect(elem).toHaveTextContent(timezone);
  });

  test('Update button click event', () => {
    render(
      <StartTimeSelection
        endDate={endDate}
        startDate={startDate}
        timezone={timezone}
        onChanged={handleChange}
      />,
    );

    const updateButton = screen.getByTestId('update-button');
    fireEvent.click(updateButton);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test.each([
    {
      initialStartDate: startDate,
      initialEndDate: endDate,
      newStartDate: startDate.clone().add(1, 'hour'),
      newEndDate: endDate.clone().add(1, 'hour'),
      expectedStartTime: '14:00',
      expectedEndTime: '15:00',
      expectedStartDate: '01/01/2019',
      expectedEndDate: '01/02/2019',
      description: 'should update startTime and endTime on props change',
    },
    {
      initialStartDate: startDate,
      initialEndDate: endDate,
      newStartDate: startDate.clone().subtract(1, 'day'),
      newEndDate: endDate.clone().add(1, 'day'),
      expectedStartTime: '13:00',
      expectedEndTime: '14:00',
      expectedStartDate: '31/12/2018',
      expectedEndDate: '02/02/2019',
      description: 'should update startDate and endDate on props change',
    },
  ])(
    '$description',
    ({
      initialStartDate,
      initialEndDate,
      newStartDate,
      newEndDate,
      expectedStartTime,
      expectedEndTime,
      expectedStartDate,
      expectedEndDate,
    }) => {
      const {rerender} = render(
        <StartTimeSelection
          endDate={initialEndDate}
          startDate={initialStartDate}
          timezone={timezone}
          onChanged={handleChange}
        />,
      );

      expect(screen.getByLabelText('Start Time')).toHaveValue('13:00');
      expect(screen.getByLabelText('End Time')).toHaveValue('14:00');
      expect(screen.getByLabelText('Start Date')).toHaveValue('01/01/2019');
      expect(screen.getByLabelText('End Date')).toHaveValue('01/02/2019');

      rerender(
        <StartTimeSelection
          endDate={newEndDate}
          startDate={newStartDate}
          timezone={timezone}
          onChanged={handleChange}
        />,
      );

      expect(screen.getByLabelText('Start Time')).toHaveValue(
        expectedStartTime,
      );
      expect(screen.getByLabelText('End Time')).toHaveValue(expectedEndTime);
      expect(screen.getByLabelText('Start Date')).toHaveValue(
        expectedStartDate,
      );
      expect(screen.getByLabelText('End Date')).toHaveValue(expectedEndDate);
    },
  );
});
