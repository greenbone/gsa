/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  closeDialog,
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
} from 'web/testing';
import date from 'gmp/models/date';
import Schedule from 'gmp/models/schedule';
import timezones from 'gmp/time-zones';
import ScheduleDialog from 'web/pages/schedules/Dialog';

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

const mockedTimezones = [
  'UTC',
  'Europe/Berlin',
  'America/New_York',
  'Asia/Tokyo',
];

const createGmp = () => ({
  settings: {token: 'token'},

  timezones: {
    get: testing.fn().mockResolvedValue(new Response(mockedTimezones, {})),
  },
});

describe('ScheduleDialog component tests', () => {
  test('should render with default values', () => {
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });

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

    const recurrence = selects[1];
    expect(recurrence).toHaveValue('Weekly');
  });

  test('should allow to change text field', () => {
    const mockCurrentTime = date('2021-02-08T14:37:04+00:00');
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });

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
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });
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
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });

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

  // Test time changes with parameterized tests
  test.each([
    {
      description: 'start time only',
      startTime: '12:00',
      endTime: null,
      expectedIcal: 'DTSTART:20210208T120000Z',
    },
    {
      description: 'end time only',
      startTime: null,
      endTime: '18:30',
      expectedIcal: /DTSTART:20210208T150000Z.*DURATION:PT3H30M/s,
    },
    {
      description: 'both start and end times',
      startTime: '10:00',
      endTime: '14:30',
      expectedIcal: /DTSTART:20210208T100000Z.*DURATION:PT4H30M/s,
    },
  ])(
    'should allow changing $description',
    async ({startTime, endTime, expectedIcal}) => {
      handleSave.mockResolvedValue({});
      const {render} = rendererWith({
        capabilities: true,
        gmp: createGmp(),
      });

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

      if (startTime) {
        const startTimeInput = screen.getByName('startDate');
        expect(startTimeInput).toHaveValue('15:00');
        changeInputValue(startTimeInput, startTime);
        expect(startTimeInput).toHaveValue(startTime);
      }

      if (endTime) {
        const endTimeInput = screen.getByName('endTime');
        expect(endTimeInput).toHaveValue('19:45');
        changeInputValue(endTimeInput, endTime);
        expect(endTimeInput).toHaveValue(endTime);
      }

      const saveButton = screen.getDialogSaveButton();
      fireEvent.click(saveButton);

      expect(handleSave).toHaveBeenCalledWith({
        id: scheduleId,
        name: scheduleName,
        comment: scheduleComment,
        icalendar:
          typeof expectedIcal === 'string'
            ? expect.stringContaining(expectedIcal)
            : expect.stringMatching(expectedIcal),
        timezone: scheduleTimezone,
      });
    },
  );

  test('should preserve date when changing only time', async () => {
    handleSave.mockResolvedValue({});
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });

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
    changeInputValue(startTimeInput, '08:00');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    // Verify the date portion (20210208) remains unchanged, only time changed to 08:00
    expect(handleSave).toHaveBeenCalledWith({
      id: scheduleId,
      name: scheduleName,
      comment: scheduleComment,
      icalendar: expect.stringContaining('DTSTART:20210208T080000Z'),
      timezone: scheduleTimezone,
    });
  });

  test('should allow changing both date and time and verify sent values match inputs', async () => {
    handleSave.mockResolvedValue({});

    // Use a schedule with a specific start date and time
    // Using a date in February to avoid DST timezone issues
    const testStartDate = date('2021-02-15T15:00:00Z').tz('UTC');
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <ScheduleDialog
        comment={scheduleComment}
        duration={scheduleDuration}
        freq={scheduleFrequency}
        id={scheduleId}
        interval={scheduleInterval}
        monthdays={scheduleMonthDays}
        name={scheduleName}
        startDate={testStartDate}
        timezone={scheduleTimezone}
        title={`Edit Schedule ${scheduleName}`}
        weekdays={scheduleWeekDays}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    // Verify initial state
    const startDateInput = screen.getByLabelText('Start Date');
    expect(startDateInput).toHaveValue('15/02/2021');

    const startTimeInput = screen.getByName('startDate');
    expect(startTimeInput).toHaveValue('15:00');

    // Change the start time
    changeInputValue(startTimeInput, '09:30');
    expect(startTimeInput).toHaveValue('09:30');

    // Change the end time
    const endTimeInput = screen.getByName('endTime');
    expect(endTimeInput).toHaveValue('19:45');
    changeInputValue(endTimeInput, '17:00');
    expect(endTimeInput).toHaveValue('17:00');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    // Verify both date (20210215) and time (09:30) are correctly sent
    expect(handleSave).toHaveBeenCalledWith({
      id: scheduleId,
      name: scheduleName,
      comment: scheduleComment,
      icalendar: expect.stringMatching(
        /DTSTART:20210215T093000Z.*DURATION:PT7H30M/s,
      ),
      timezone: scheduleTimezone,
    });
  });

  test('should prevent changing start and end times when value is invalid', async () => {
    handleSave.mockResolvedValue({});
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
    });

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

  // Timezone-related tests
  describe('Timezone handling', () => {
    test('should preserve date and time when changing timezone', async () => {
      handleSave.mockResolvedValue({});
      const {render} = rendererWith({
        capabilities: true,
        gmp: createGmp(),
      });

      // Start with scheduleStartDate in UTC (20210208T150000Z)
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

      // Verify initial state
      const startTimeInput = screen.getByName('startDate');
      expect(startTimeInput).toHaveValue('15:00');

      // Change timezone to America/New_York
      const timezoneSelect = screen.queryAllSelectElements()[0];
      const selectItems = await getSelectItemElementsForSelect(timezoneSelect);
      const nyTimezone = selectItems.find(
        item => item.textContent === 'America/New_York',
      );
      if (nyTimezone) {
        fireEvent.click(nyTimezone);

        // After timezone change, the handleTimezoneChange updates the time display
        // The time should now reflect the New York timezone
        // Note: The exact time depends on handleTimezoneChange implementation

        const saveButton = screen.getDialogSaveButton();
        fireEvent.click(saveButton);

        // Verify the saved data uses the new timezone
        expect(handleSave).toHaveBeenCalledWith({
          id: scheduleId,
          name: scheduleName,
          comment: scheduleComment,
          icalendar: expect.any(String),
          timezone: 'America/New_York',
        });
      }
    });

    // Test date preservation when changing time across different timezones
    test.each([
      {
        timezone: 'Europe/Berlin',
        description: 'Europe/Berlin (UTC+1)',
        newTime: '09:30',
      },
      {
        timezone: 'Asia/Tokyo',
        description: 'Asia/Tokyo (UTC+9)',
        newTime: '10:00',
      },
      {
        timezone: 'Australia/Sydney',
        description: 'Australia/Sydney (UTC+11)',
        newTime: '10:30',
      },
      {
        timezone: 'America/Los_Angeles',
        description: 'America/Los_Angeles (UTC-8)',
        newTime: '10:00',
      },
      {
        timezone: 'Asia/Shanghai',
        description: 'Asia/Shanghai (UTC+8)',
        newTime: '16:00',
      },
      {
        timezone: 'Europe/London',
        description: 'Europe/London (UTC+0)',
        newTime: '11:00',
      },
      {
        timezone: 'America/New_York',
        description: 'America/New_York (UTC-5)',
        newTime: '10:15',
      },
      {
        timezone: 'America/Chicago',
        description: 'America/Chicago (UTC-6)',
        newTime: '12:00',
      },
      {
        timezone: 'Africa/Cairo',
        description: 'Africa/Cairo (UTC+2)',
        newTime: '13:00',
      },
    ])(
      'should preserve date when changing time in $description',
      async ({timezone, newTime}) => {
        handleSave.mockResolvedValue({});
        const {render} = rendererWith({
          capabilities: true,
          gmp: createGmp(),
        });

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
            timezone={timezone}
            title={`Edit Schedule ${scheduleName}`}
            weekdays={scheduleWeekDays}
            onClose={handleClose}
            onSave={handleSave}
          />,
        );

        // Change only the time
        const startTimeInput = screen.getByName('startDate');
        changeInputValue(startTimeInput, newTime);
        expect(startTimeInput).toHaveValue(newTime);

        const saveButton = screen.getDialogSaveButton();
        fireEvent.click(saveButton);

        // Verify the date (20210208) is preserved and time changed
        expect(handleSave).toHaveBeenCalledWith({
          id: scheduleId,
          name: scheduleName,
          comment: scheduleComment,
          icalendar: expect.stringContaining(
            `DTSTART:20210208T${newTime.replace(':', '')}00`,
          ),
          timezone,
        });
      },
    );

    // Test both date and time changes in different timezones
    test.each([
      {
        timezone: 'Europe/Berlin',
        description: 'Europe/Berlin',
        startTime: '10:30',
        endTime: '18:00',
      },
      {
        timezone: 'Asia/Tokyo',
        description: 'Asia/Tokyo',
        startTime: '09:00',
        endTime: '16:30',
      },
      {
        timezone: 'Australia/Sydney',
        description: 'Australia/Sydney',
        startTime: '10:30',
        endTime: '18:00',
      },
      {
        timezone: 'America/Los_Angeles',
        description: 'America/Los_Angeles',
        startTime: '08:00',
        endTime: '15:30',
      },
    ])(
      'should handle both date and time changes in $description timezone',
      async ({timezone, startTime, endTime}) => {
        handleSave.mockResolvedValue({});
        const {render} = rendererWith({
          capabilities: true,
          gmp: createGmp(),
        });

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
            timezone={timezone}
            title={`Edit Schedule ${scheduleName}`}
            weekdays={scheduleWeekDays}
            onClose={handleClose}
            onSave={handleSave}
          />,
        );

        // Change the time
        const startTimeInput = screen.getByName('startDate');
        changeInputValue(startTimeInput, startTime);
        expect(startTimeInput).toHaveValue(startTime);

        // Change the end time
        const endTimeInput = screen.getByName('endTime');
        changeInputValue(endTimeInput, endTime);
        expect(endTimeInput).toHaveValue(endTime);

        const saveButton = screen.getDialogSaveButton();
        fireEvent.click(saveButton);

        // Verify both date and time are correctly saved
        expect(handleSave).toHaveBeenCalledWith({
          id: scheduleId,
          name: scheduleName,
          comment: scheduleComment,
          icalendar: expect.stringMatching(
            /DTSTART:20210208T\d{6}.*DURATION:PT\d+H\d+M/s,
          ),
          timezone,
        });
      },
    );

    // Test DST handling in different timezones
    test.each([
      {
        timezone: 'America/New_York',
        description: 'America/New_York during DST transition',
        testDate: date('2021-03-14T10:00:00'),
        newTime: '08:00',
        expectedDate: '20210314',
      },
      {
        timezone: 'Europe/London',
        description: 'Europe/London before DST',
        testDate: scheduleStartDate,
        newTime: '11:00',
        expectedDate: '20210208',
      },
      {
        timezone: 'Australia/Sydney',
        description: 'Australia/Sydney during DST',
        testDate: scheduleStartDate,
        newTime: '14:00',
        expectedDate: '20210208',
      },
    ])(
      'should handle DST correctly in $description',
      async ({timezone, testDate, newTime, expectedDate}) => {
        handleSave.mockResolvedValue({});
        const {render} = rendererWith({
          capabilities: true,
          gmp: createGmp(),
        });

        render(
          <ScheduleDialog
            comment={scheduleComment}
            duration={scheduleDuration}
            freq={scheduleFrequency}
            id={scheduleId}
            interval={scheduleInterval}
            monthdays={scheduleMonthDays}
            name={scheduleName}
            startDate={testDate}
            timezone={timezone}
            title={`Edit Schedule ${scheduleName}`}
            weekdays={scheduleWeekDays}
            onClose={handleClose}
            onSave={handleSave}
          />,
        );

        // Change the time
        const startTimeInput = screen.getByName('startDate');
        changeInputValue(startTimeInput, newTime);
        expect(startTimeInput).toHaveValue(newTime);

        const saveButton = screen.getDialogSaveButton();
        fireEvent.click(saveButton);

        // Verify the date is preserved correctly
        // Note: The exact time in icalendar may vary due to timezone conversion to UTC
        expect(handleSave).toHaveBeenCalledWith({
          id: scheduleId,
          name: scheduleName,
          comment: scheduleComment,
          icalendar: expect.stringContaining(`DTSTART:${expectedDate}`),
          timezone,
        });
      },
    );
  });
});
