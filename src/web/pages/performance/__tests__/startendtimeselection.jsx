/* Copyright (C) 2017-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import MomentDate from 'gmp/models/date';
import {render, screen, fireEvent} from 'web/utils/testing';

import StartTimeSelection from '../startendtimeselection';

const timezone = 'CET';
const startDate = MomentDate('2019-01-01T12:00Z').tz(timezone);
const endDate = MomentDate('2019-02-01T13:00Z').tz(timezone);

const handleChange = testing.fn();

describe('StartTimeSelection tests', () => {
  test('should render correct dates', () => {
    const {element} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    expect(element).toBeVisible();

    const checkElementVisibilityAndContent = (
      labelText,
      buttonName,
      buttonContent,
      timePickerLabel,
      timePickerValue,
    ) => {
      const label = screen.getByLabelText(labelText);
      expect(label).toBeVisible();

      const button = screen.getByRole('button', {name: buttonName});
      expect(button).toBeVisible();
      expect(button).toHaveTextContent(buttonContent);

      const timePicker = screen.getByLabelText(timePickerLabel);
      expect(timePicker).toBeVisible();
      expect(timePicker).toHaveValue(timePickerValue);
    };

    checkElementVisibilityAndContent(
      'Start Date',
      '01/01/2019',
      '01/01/2019',
      'Start Time',
      '13:00',
    );
    checkElementVisibilityAndContent(
      'End Date',
      '01/02/2019',
      '01/02/2019',
      'End Time',
      '14:00',
    );
  });

  test('should display timezone', () => {
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
  test('Update button click event', () => {
    const {getByTestId} = render(
      <StartTimeSelection
        timezone={timezone}
        startDate={startDate}
        endDate={endDate}
        onChanged={handleChange}
      />,
    );

    const updateButton = getByTestId('update-button');
    fireEvent.click(updateButton);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
