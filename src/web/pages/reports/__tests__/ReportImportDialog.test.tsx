/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, openSelectElement, render, screen} from 'web/testing';
import Task from 'gmp/models/task';
import {YES_VALUE} from 'gmp/parser';
import ReportImportDialog from 'web/pages/reports/ReportImportDialog';

describe('ReportImportDialog tests', () => {
  test('renders with default values', async () => {
    const tasks = [
      new Task({id: '1', name: 'Task 1'}),
      new Task({id: '2', name: 'Task 2'}),
    ];
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <ReportImportDialog
        task_id="1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Import Report')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Import'})).toBeInTheDocument();
    expect(screen.getByName('task_id')).toHaveValue('1');
    expect(screen.getByTestId('new-container-task')).toBeInTheDocument();
    expect(screen.getByName('in_assets')).toBeChecked();
  });

  test('should call onSave', async () => {
    const tasks = [
      new Task({id: '1', name: 'Task 1'}),
      new Task({id: '2', name: 'Task 2'}),
    ];
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <ReportImportDialog
        task_id="2"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const importButton = screen.getDialogSaveButton();
    fireEvent.click(importButton);

    expect(onSave).toHaveBeenCalledWith({
      task_id: '2',
      in_assets: YES_VALUE,
      xml_file: undefined,
    });
  });

  test('should call onClose when dialog is closed', async () => {
    const tasks = [
      new Task({id: '1', name: 'Task 1'}),
      new Task({id: '2', name: 'Task 2'}),
    ];
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <ReportImportDialog
        task_id="1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('should allow to change task', async () => {
    const tasks = [
      new Task({id: '1', name: 'Task 1'}),
      new Task({id: '2', name: 'Task 2'}),
    ];
    const onSave = testing.fn();
    const onClose = testing.fn();
    const onTaskChange = testing.fn();

    render(
      <ReportImportDialog
        task_id="1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
        onTaskChange={onTaskChange}
      />,
    );

    const select = screen.getByName('task_id') as HTMLSelectElement;
    await openSelectElement(select);

    const items = screen.getSelectItemElements();
    fireEvent.click(items[1]); // Select "Task 2"
    expect(onTaskChange).toHaveBeenCalledWith('2', 'task_id');
  });

  test("should allow to change 'in_assets' value", async () => {
    const tasks = [
      new Task({id: '1', name: 'Task 1'}),
      new Task({id: '2', name: 'Task 2'}),
    ];
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <ReportImportDialog
        task_id="1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const radios = screen.getAllByName('in_assets');
    expect(radios[0]).toBeChecked(); // Default is YES_VALUE
    fireEvent.click(radios[1]); // Change to NO_VALUE
    expect(radios[1]).toBeChecked();
  });

  test('should allow to add a file', async () => {
    const tasks = [
      new Task({id: '1', name: 'Task 1'}),
      new Task({id: '2', name: 'Task 2'}),
    ];
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <ReportImportDialog
        task_id="1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const fileInput = screen.getByName('xml_file');
    fireEvent.change(fileInput, {target: {files: ['bar']}});
    const importButton = screen.getDialogSaveButton();
    fireEvent.click(importButton);

    expect(onSave).toHaveBeenCalledWith({
      task_id: '1',
      in_assets: YES_VALUE,
      xml_file: 'bar',
    });
  });
});
