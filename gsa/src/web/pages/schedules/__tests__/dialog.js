/* Copyright (C) 2021 Greenbone Networks GmbH
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
import Schedule from 'gmp/models/schedule';

import {render, fireEvent, screen} from 'web/utils/testing';

import ScheduleDialog from '../dialog';

setLocale('en');

let handleSave;
let handleClose;

beforeEach(() => {
  handleSave = jest.fn();
  handleClose = jest.fn();
});

const schedule = Schedule.fromElement({
  comment: 'hello world',
  name: 'schedule 1',
  id: 'foo',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1//EN\nBEGIN:VEVENT\nDTSTART:20210208T150000Z\nDURATION:PT4H45M\nRRULE:FREQ=WEEKLY\nUID:foo\nDTSTAMP:20210208T143704Z\nEND:VEVENT\nEND:VCALENDAR',
  creationTime: '2021-02-08T14:37:04+00:00',
  modificationTime: '2021-02-08T14:37:04+00:00',
  owner: 'admin',
  permissions: [{name: 'Everything'}],
  userTags: null,
  timezone: 'UTC',
  inUse: false,
});
const {
  comment: scheduleComment,
  event,
  name: scheduleName,
  id: scheduleId,
  timezone: scheduleTimezone,
} = schedule;
const {
  duration: scheduleDuration,
  startDate: scheduleStartDate,
  recurrence,
} = event;
const {
  interval: scheduleInterval,
  freq: scheduleFrequency,
  monthdays: scheduleMonthDays,
  weekdays: scheduleWeekDays,
} = recurrence;

describe('ScheduleDialog component tests', () => {
  test('should render with default values', () => {
    const {baseElement, getAllByTestId} = render(
      <ScheduleDialog
        id={scheduleId}
        title={`Edit Schedule ${scheduleName}`}
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        interval={scheduleInterval}
        weekdays={scheduleWeekDays}
        monthdays={scheduleMonthDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    const formgroups = getAllByTestId('formgroup-title');
    const spinnerInputs = getAllByTestId('spinner-input');

    expect(formgroups.length).toBe(7);

    expect(formgroups[0]).toHaveTextContent('Name');
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveAttribute('value', 'schedule 1'); // name field

    expect(formgroups[1]).toHaveTextContent('Comment');
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveAttribute('value', 'hello world'); // comment field

    expect(formgroups[2]).toHaveTextContent('Timezone');
    const defaultTimezone = screen.getAllByTitle(
      'Coordinated Universal Time/UTC',
    );
    expect(defaultTimezone[0]).toBeInTheDocument();

    expect(formgroups[3]).toHaveTextContent('First Run');
    expect(baseElement).toHaveTextContent('02/08/2021');
    expect(spinnerInputs.length).toBe(4);
    expect(spinnerInputs[0]).toHaveAttribute('value', '15');
    expect(spinnerInputs[1]).toHaveAttribute('value', '0');

    expect(spinnerInputs[2]).toHaveAttribute('value', '19');
    expect(spinnerInputs[3]).toHaveAttribute('value', '45');

    expect(baseElement).toHaveTextContent('5 hours');

    const recurrenceValue = screen.getAllByTitle('Weekly');

    expect(recurrenceValue[0]).toBeInTheDocument();
  });

  test('should allow to change text field', () => {
    const {getByName, getByTestId} = render(
      <ScheduleDialog
        title={'New Schedule'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    expect(nameInput).toHaveAttribute('value', 'Unnamed');
    fireEvent.change(nameInput, {target: {value: 'foo'}});
    expect(nameInput).toHaveAttribute('value', 'foo');

    const commentInput = getByName('comment');
    expect(commentInput).toHaveAttribute('value', '');
    fireEvent.change(commentInput, {target: {value: 'bar'}});
    expect(commentInput).toHaveAttribute('value', 'bar');

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled(); // handleSave in dialog is over 100 lines long and generates an icalendar. toHaveBeenCalledWith(...) is extremely difficult to test...
  });

  test('should allow to close the dialog', () => {
    const {getByTestId} = render(
      <ScheduleDialog
        title={'New Schedule'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-title-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow changing spinner values', () => {
    const {getAllByTestId, getByTestId} = render(
      <ScheduleDialog
        id={scheduleId}
        title={`Edit Schedule ${scheduleName}`}
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        interval={scheduleInterval}
        weekdays={scheduleWeekDays}
        monthdays={scheduleMonthDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const spinnerUpButtons = getAllByTestId('spinner-up');
    const spinnerDownButtons = getAllByTestId('spinner-down');
    const spinnerInputs = getAllByTestId('spinner-input');

    expect(spinnerUpButtons.length).toBe(4);
    expect(spinnerDownButtons.length).toBe(4);
    expect(spinnerInputs.length).toBe(4);

    fireEvent.click(spinnerUpButtons[0]);
    expect(spinnerInputs[0]).toHaveAttribute('value', '16');

    fireEvent.click(spinnerDownButtons[0]);
    expect(spinnerInputs[0]).toHaveAttribute('value', '15');

    fireEvent.click(spinnerUpButtons[1]);
    expect(spinnerInputs[1]).toHaveAttribute('value', '1');

    fireEvent.click(spinnerDownButtons[1]);
    expect(spinnerInputs[1]).toHaveAttribute('value', '0');

    fireEvent.click(spinnerUpButtons[2]);
    expect(spinnerInputs[2]).toHaveAttribute('value', '20');

    fireEvent.click(spinnerDownButtons[2]);
    expect(spinnerInputs[2]).toHaveAttribute('value', '19');

    fireEvent.click(spinnerUpButtons[3]);
    expect(spinnerInputs[3]).toHaveAttribute('value', '46');

    fireEvent.click(spinnerDownButtons[3]);
    expect(spinnerInputs[3]).toHaveAttribute('value', '45');

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });

  test('should allow changing select values', () => {
    const {getAllByTestId, getByTestId} = render(
      <ScheduleDialog
        id={scheduleId}
        title={`Edit Schedule ${scheduleName}`}
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        interval={scheduleInterval}
        weekdays={scheduleWeekDays}
        monthdays={scheduleMonthDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    let selectItems;
    const selectedValues = getAllByTestId('select-selected-value');
    const selectOpenButton = getAllByTestId('select-open-button');
    expect(selectOpenButton.length).toBe(2);
    expect(selectedValues.length).toBe(2);

    expect(selectedValues[0]).toHaveTextContent(
      'Coordinated Universal Time/UTC',
    );
    expect(selectedValues[1]).toHaveTextContent('Weekly');

    fireEvent.click(selectOpenButton[0]);

    selectItems = getAllByTestId('select-item');
    expect(selectItems.length).toBe(422);
    fireEvent.click(selectItems[1]);

    expect(selectedValues[0]).toHaveTextContent('Africa/Abidjan');

    fireEvent.click(selectOpenButton[1]);

    selectItems = getAllByTestId('select-item');
    expect(selectItems.length).toBe(8);
    fireEvent.click(selectItems[6]);

    expect(selectedValues[1]).toHaveTextContent(
      'Workweek (Monday till Friday)',
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });
});
