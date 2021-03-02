/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import Capabilities from 'gmp/capabilities/capabilities';

import Date, {setLocale} from 'gmp/models/date';

import Task from 'gmp/models/task';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import ModifyTaskWizard from '../modifytaskwizard';

setLocale('en');

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
const startTimezone = 'UTC';

describe('ModifyTaskWizard component tests', () => {
  test('should render full modify wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {baseElement} = render(
      <ModifyTaskWizard
        startDate={startDate}
        tasks={tasks}
        reschedule={reschedule}
        taskId={taskId}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioInputs = screen.getAllByTestId('radio-input');
    const radioTitles = screen.getAllByTestId('radio-title');

    expect(baseElement).toHaveTextContent('Setting a start time');
    expect(baseElement).toHaveTextContent('Setting an email Address');

    expect(formgroups[0]).toHaveTextContent('Task');

    expect(formgroups[1]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '0');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Do not change');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule');

    expect(formgroups[2]).toHaveTextContent('Email report to');
  });

  test('should not render schedule without permission', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: alertCapabilities,
    });

    const {baseElement} = render(
      <ModifyTaskWizard
        startDate={startDate}
        tasks={tasks}
        reschedule={reschedule}
        taskId={taskId}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = screen.getAllByTestId('formgroup-title');

    expect(baseElement).not.toHaveTextContent('Setting a start time');
    expect(baseElement).toHaveTextContent('Setting an email Address');

    expect(formgroups[0]).toHaveTextContent('Task');

    expect(formgroups.length).toBe(2);
    expect(baseElement).not.toHaveTextContent('Start Time');
    expect(baseElement).not.toHaveTextContent('Create Schedule');
    expect(baseElement).not.toHaveTextContent('Do not change');

    expect(formgroups[1]).toHaveTextContent('Email report to');
  });

  test('should not render alert without permission', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: scheduleCapabilities,
    });

    const {baseElement} = render(
      <ModifyTaskWizard
        startDate={startDate}
        tasks={tasks}
        reschedule={reschedule}
        taskId={taskId}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioInputs = screen.getAllByTestId('radio-input');
    const radioTitles = screen.getAllByTestId('radio-title');

    expect(baseElement).toHaveTextContent('Setting a start time');
    expect(baseElement).not.toHaveTextContent('Setting an email Address');

    expect(formgroups[0]).toHaveTextContent('Task');

    expect(formgroups[1]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '0');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Do not change');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule');

    expect(formgroups.length).toBe(2);
    expect(baseElement).not.toHaveTextContent('Email report to');
  });

  test('should allow to close the modify wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <ModifyTaskWizard
        startDate={startDate}
        tasks={tasks}
        reschedule={reschedule}
        taskId={taskId}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getByTestId('dialog-title-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the modify wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <ModifyTaskWizard
        startDate={startDate}
        tasks={tasks}
        reschedule={reschedule}
        taskId={taskId}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = screen.getByTestId('dialog-close-button');

    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the modify wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <ModifyTaskWizard
        startDate={startDate}
        tasks={tasks}
        reschedule={reschedule}
        taskId={taskId}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const emailInput = getByName('alertEmail');
    fireEvent.change(emailInput, {target: {value: 'foo@bar.com'}});

    const saveButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      alertEmail: 'foo@bar.com',
      reschedule: 0,
      startDate,
      startTimezone,
      taskId,
      tasks: tasks,
    });
  });
});
