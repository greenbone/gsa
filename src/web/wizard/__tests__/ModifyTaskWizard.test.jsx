/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Date from 'gmp/models/date';
import Task from 'gmp/models/task';
import ModifyTaskWizard from 'web/wizard/ModifyTaskWizard';

const alertCapabilities = new Capabilities(['create_alert', 'get_alerts']);
const scheduleCapabilities = new Capabilities([
  'create_schedule',
  'get_schedules',
]);

const task1 = Task.fromElement({id: '1234', name: 'task 1'});
const taskId = '1234';
const tasks = [task1];

const reschedule = 0;

const startDate = Date('2020-01-01T12:10:00Z');
const startMinute = 10;
const startHour = 12;
const startTimezone = 'UTC';

const getFormGroupTitles = () => {
  return document.body.querySelectorAll('.mantine-Text-root');
};

const getRadioTitles = () => {
  return document.body.querySelectorAll('.mantine-Radio-label');
};

describe('ModifyTaskWizard component tests', () => {
  test('should render full modify wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {baseElement} = render(
      <ModifyTaskWizard
        reschedule={reschedule}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        task_id={taskId}
        tasks={tasks}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formGroups = getFormGroupTitles();
    const radioInputs = screen.getRadioInputs();
    const radioTitles = getRadioTitles();

    const selectedDate = '01/01/2020';
    const datePickerLabel = screen.getByLabelText('Start Date');
    const startDateButton = screen.getByDisplayValue(selectedDate);

    const selectedTime = '12:10';
    const timePickerLabel = screen.getByLabelText('Start Time');

    expect(startDateButton).toBeVisible();
    expect(datePickerLabel).toBeVisible();
    expect(startDateButton).toHaveValue(selectedDate);

    expect(timePickerLabel).toBeVisible();
    expect(timePickerLabel).toHaveValue(selectedTime);

    expect(baseElement).toHaveTextContent('Setting a start time');
    expect(baseElement).toHaveTextContent('Setting an email Address');

    expect(formGroups[0]).toHaveTextContent('Task');

    expect(formGroups[1]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '0');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Do not change');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule');

    expect(formGroups[2]).toHaveTextContent('Email report to');
    expect(startDateButton).toBeVisible();
  });

  test('should not render schedule without permission', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: alertCapabilities,
    });

    const {baseElement} = render(
      <ModifyTaskWizard
        reschedule={reschedule}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        task_id={taskId}
        tasks={tasks}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formGroups = getFormGroupTitles();

    expect(baseElement).not.toHaveTextContent('Setting a start time');
    expect(baseElement).toHaveTextContent('Setting an email Address');

    expect(formGroups[0]).toHaveTextContent('Task');

    expect(formGroups.length).toBe(2);
    expect(baseElement).not.toHaveTextContent('Start Time');
    expect(baseElement).not.toHaveTextContent('Create Schedule');
    expect(baseElement).not.toHaveTextContent('Do not change');

    expect(formGroups[1]).toHaveTextContent('Email report to');
  });

  test('should not render alert without permission', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: scheduleCapabilities,
    });

    const {baseElement} = render(
      <ModifyTaskWizard
        reschedule={reschedule}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        task_id={taskId}
        tasks={tasks}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formGroups = getFormGroupTitles();
    const radioInputs = screen.getRadioInputs();
    const radioTitles = getRadioTitles();

    expect(baseElement).toHaveTextContent('Setting a start time');
    expect(baseElement).not.toHaveTextContent('Setting an email Address');

    expect(formGroups[0]).toHaveTextContent('Task');

    expect(formGroups[1]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '0');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Do not change');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule');

    expect(formGroups.length).toBe(2);
    expect(baseElement).not.toHaveTextContent('Email report to');
  });

  test('should allow to close the modify wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <ModifyTaskWizard
        reschedule={reschedule}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        task_id={taskId}
        tasks={tasks}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getDialogXButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the modify wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <ModifyTaskWizard
        reschedule={reschedule}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        task_id={taskId}
        tasks={tasks}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the modify wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <ModifyTaskWizard
        reschedule={reschedule}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        task_id={taskId}
        tasks={tasks}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const emailInput = screen.getByName('alert_email');
    changeInputValue(emailInput, 'foo@bar.com');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      alert_email: 'foo@bar.com',
      reschedule: 0,
      start_date: startDate,
      start_hour: startHour,
      start_minute: startMinute,
      start_timezone: startTimezone,
      task_id: taskId,
      tasks: tasks,
    });
  });
});
