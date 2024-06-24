/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import MomentDate from 'gmp/models/date';
import {render, screen, fireEvent} from 'web/utils/testing';

import StartTimeSelection from '../startendtimeselection';

const timezone = 'CET';
const startDate = MomentDate('2019-01-01T12:00Z').tz(timezone);
const endDate = MomentDate('2019-01-01T13:00Z').tz(timezone);

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
    ) => {
      const label = screen.getByLabelText(labelText);
      expect(label).toBeVisible();

      const button = screen.getByRole('button', {name: buttonName});
      expect(button).toBeVisible();
      expect(button).toHaveTextContent(buttonContent);
    };

    checkElementVisibilityAndContent(
      'Start Time',
      'Jan 01, 2019, 01:00:00 PM',
      'Jan 01, 2019, 01:00:00 PM',
    );
    checkElementVisibilityAndContent(
      'End Time',
      'Jan 01, 2019, 02:00:00 PM',
      'Jan 01, 2019, 02:00:00 PM',
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
