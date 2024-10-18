/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Schedule from 'gmp/models/schedule';

import {render, fireEvent, screen} from 'web/utils/testing';

const checkElementVisibilityAndContent = (
  labelText,
  buttonName,
  buttonContent,
  timePickerLabel,
  timePickerValue,
) => {
  const label = screen.getByLabelText(labelText);
  expect(label).toBeVisible();

  const button = screen.getAllByRole('button', {name: buttonName});
  expect(button[0]).toBeVisible();
  expect(button[0]).toHaveTextContent(buttonContent);

  const timePicker = screen.getByLabelText(timePickerLabel);
  expect(timePicker).toBeVisible();
  expect(timePicker).toHaveValue(timePickerValue);
};

import {
  changeInputValue,
  clickElement,
  closeDialog,
  getDialogSaveButton,
  queryAllSelectElements,
  getSelectItemElementsForSelect,
  getTextInputs,
} from 'web/components/testing';

import ScheduleDialog from '../dialog';

let handleSave;
let handleClose;

beforeEach(() => {
  handleSave = testing.fn();
  handleClose = testing.fn();
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
    const {baseElement} = render(
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

    const inputs = getTextInputs();
    const selects = queryAllSelectElements();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('schedule 1'); // name field

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue('hello world'); // comment field

    const defaultTimezone = selects[0];
    expect(defaultTimezone).toHaveValue('Coordinated Universal Time/UTC');

    checkElementVisibilityAndContent(
      'Start Date',
      '08/02/2021',
      '08/02/2021',
      'Start Time',
      '15:00',
    );
    checkElementVisibilityAndContent(
      'End Date',
      '08/02/2021',
      '08/02/2021',
      'End Time',
      '19:45',
    );

    expect(baseElement).toHaveTextContent('5 hours');

    const recurrence = selects[1];
    expect(recurrence).toHaveValue('Weekly');
  });

  test('should allow to change text field', () => {
    const {getByName} = render(
      <ScheduleDialog
        title={'New Schedule'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    expect(nameInput).toHaveValue('Unnamed');
    changeInputValue(nameInput, 'foo');
    expect(nameInput).toHaveValue('foo');

    const commentInput = getByName('comment');
    expect(commentInput).toHaveValue('');
    changeInputValue(commentInput, 'bar');
    expect(commentInput).toHaveValue('bar');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled(); // handleSave in dialog is over 100 lines long and generates an icalendar. toHaveBeenCalledWith(...) is extremely difficult to test...
  });

  test('should allow to close the dialog', () => {
    render(
      <ScheduleDialog
        title={'New Schedule'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    closeDialog();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow changing select values', async () => {
    render(
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
    const selects = queryAllSelectElements();
    expect(selects[0]).toHaveValue('Coordinated Universal Time/UTC');
    expect(selects[1]).toHaveValue('Weekly');

    selectItems = await getSelectItemElementsForSelect(selects[0]);
    expect(selectItems.length).toBe(422);
    await clickElement(selectItems[1]);
    expect(selects[0]).toHaveValue('Africa/Abidjan');

    selectItems = await getSelectItemElementsForSelect(selects[1]);
    expect(selectItems.length).toBe(8);
    await clickElement(selectItems[6]);

    expect(selects[1]).toHaveValue('Workweek (Monday till Friday)');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });
});
