/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import Schedule from 'gmp/models/schedule';
import timezones from 'gmp/timezones';
import ScheduleDialog from 'web/pages/schedules/Dialog';
import {
  changeInputValue,
  closeDialog,
  getSelectItemElementsForSelect,
  screen,
} from 'web/testing';
import {render, fireEvent} from 'web/utils/Testing';

const checkElementVisibilityAndContent = (
  labelText,
  inputValue,
  inputContent,
  timePickerLabel,
  timePickerValue,
) => {
  const label = screen.getByLabelText(labelText);
  expect(label).toBeVisible();

  const input = screen.getAllByDisplayValue(inputValue);
  expect(input[0]).toBeVisible();
  expect(input[0]).toHaveValue(inputContent);

  const timePicker = screen.getByLabelText(timePickerLabel);
  expect(timePicker).toBeVisible();
  expect(timePicker).toHaveValue(timePickerValue);
};

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
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        id={scheduleId}
        interval={scheduleInterval}
        monthdays={scheduleMonthDays}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        title={`Edit Schedule ${scheduleName}`}
        weekdays={scheduleWeekDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const inputs = screen.queryTextInputs();
    const selects = screen.queryAllSelectElements();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('schedule 1'); // name field

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue('hello world'); // comment field

    const defaultTimezone = selects[0];
    expect(defaultTimezone).toHaveValue('UTC');

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
    const mockCurrentTime = date('2021-02-08T14:37:04+00:00');

    render(
      <ScheduleDialog
        startDate={mockCurrentTime}
        title={'New Schedule'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    expect(nameInput).toHaveValue('Unnamed');
    changeInputValue(nameInput, 'foo');
    expect(nameInput).toHaveValue('foo');

    const commentInput = screen.getByName('comment');
    expect(commentInput).toHaveValue('');
    changeInputValue(commentInput, 'bar');
    expect(commentInput).toHaveValue('bar');

    handleSave.mockResolvedValue({});

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
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
    handleSave.mockResolvedValue({});

    render(
      <ScheduleDialog
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        id={scheduleId}
        interval={scheduleInterval}
        monthdays={scheduleMonthDays}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        title={`Edit Schedule ${scheduleName}`}
        weekdays={scheduleWeekDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    let selectItems;
    const selects = screen.queryAllSelectElements();
    expect(selects[0]).toHaveValue('UTC');
    expect(selects[1]).toHaveValue('Weekly');

    selectItems = await getSelectItemElementsForSelect(selects[0]);
    expect(selectItems.length).toBe(timezones.length);
    fireEvent.click(selectItems[1]);
    expect(selects[0]).toHaveValue(timezones[1]);

    selectItems = await getSelectItemElementsForSelect(selects[1]);
    expect(selectItems.length).toBe(8);
    fireEvent.click(selectItems[6]);

    expect(selects[1]).toHaveValue('Workweek (Monday till Friday)');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });

  test('should allow changing start and end times', async () => {
    handleSave.mockResolvedValue({});

    render(
      <ScheduleDialog
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        id={scheduleId}
        interval={scheduleInterval}
        monthdays={scheduleMonthDays}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        title={`Edit Schedule ${scheduleName}`}
        weekdays={scheduleWeekDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const startTimeInput = screen.getByName('startDate');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '12:00');
    expect(startTimeInput).toHaveValue('12:00');

    const endTimeInput = screen.getByName('endTime');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '13:00');
    expect(endTimeInput).toHaveValue('13:00');
  });

  test('should prevent changing start and end times when value is invalid', async () => {
    handleSave.mockResolvedValue({});

    render(
      <ScheduleDialog
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        id={scheduleId}
        interval={scheduleInterval}
        monthdays={scheduleMonthDays}
        name={scheduleName}
        startDate={scheduleStartDate}
        timezone={scheduleTimezone}
        title={`Edit Schedule ${scheduleName}`}
        weekdays={scheduleWeekDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const startTimeInput = screen.getByName('startDate');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '13');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, 'a:00');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, ':00');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '25:00');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '15:a');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '15:0');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '15:');
    expect(startTimeInput).toHaveValue('15:00');
    changeInputValue(startTimeInput, '15:62');
    expect(startTimeInput).toHaveValue('15:00');

    const endTimeInput = screen.getByName('endTime');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '15');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, 'a:00');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, ':00');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '25:00');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '19:a');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '19:0');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '19:');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '19:62');
    expect(endTimeInput).toHaveValue('19:45');
  });
});
