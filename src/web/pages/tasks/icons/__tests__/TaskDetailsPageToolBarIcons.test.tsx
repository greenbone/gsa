/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import ScanConfig from 'gmp/models/scan-config';
import {OPENVAS_SCANNER_TYPE} from 'gmp/models/scanner';
import Task, {TASK_STATUS} from 'gmp/models/task';
import TaskDetailsPageToolBarIcons from 'web/pages/tasks/icons/TaskDetailsPageToolBarIcons';

const scanConfig = ScanConfig.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  tasks: {
    task: [
      {_id: '12345', name: 'foo'},
      {_id: '678910', name: 'task2'},
    ],
  },
});

const preferences = {
  preference: [
    {
      name: 'Add results to Asset Management',
      scanner_name: 'in_assets',
      value: 'yes',
    },
    {
      name: 'Apply Overrides when adding Assets',
      scanner_name: 'assets_apply_overrides',
      value: 'yes',
    },
    {
      name: 'Min QOD when adding Assets',
      scanner_name: 'assets_min_qod',
      value: '70',
    },
    {
      name: 'Auto Delete Reports',
      scanner_name: 'auto_delete',
      value: 'no',
    },
    {
      name: 'Auto Delete Reports Data',
      scanner_name: 'auto_delete_data',
      value: '5',
    },
  ],
};

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
  },
};

const currentReport = {
  report: {
    _id: '12342',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
  },
};

const manualUrl = 'test/';

describe('Task ToolBarIcons tests', () => {
  test('should render', () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.done,
      alterable: 1,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {element} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        notesCount={2}
        overridesCount={3}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    const listIcon = screen.getByTestId('list-icon');
    expect(listIcon).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');
  });

  test('should call click handlers for new task', async () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.new,
      alterable: 0,
      report_count: {__text: 0},
      result_count: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreate).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreate).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[2]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('0');

    expect(links[3]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[4]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[5]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should call click handlers for running task', async () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      in_use: 1,
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.running,
      alterable: 0,
      current_report: currentReport,
      report_count: {__text: 1},
      result_count: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }
    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreate).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreate).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Task is still in use');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);

    const stopIcon = screen.getByTestId('stop-icon');
    expect(stopIcon).toHaveAttribute('title', 'Stop');
    fireEvent.click(stopIcon);
    expect(handleTaskStop).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should call click handlers for stopped task', async () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.stopped,
      alterable: 0,
      current_report: currentReport,
      last_report: lastReport,
      report_count: {__text: 2},
      result_count: 10,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreate).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreate).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).toHaveBeenCalledWith(task);

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('2');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('10');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should call click handlers for finished task', async () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        notesCount={2}
        overridesCount={3}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreate).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreate).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('2');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('3');
  });

  test('should not call click handlers without permission', async () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreate).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreate).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Permission to edit Task denied');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );
    fireEvent.click(startIcon);
    expect(handleTaskStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should render schedule icon if task is scheduled', () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: TASK_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
      config: scanConfig,
      schedule: {
        _id: '121314',
        name: 'schedule1',
        permissions: {permission: [{name: 'everything'}]},
      },
      schedule_periods: 1,
      preferences: preferences,
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/schedule/121314');
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is scheduled');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();
  });

  test('should call click handlers for import task', async () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      report_count: {__text: 1},
      result_count: 1,
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
    });
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleImportTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <TaskDetailsPageToolBarIcons
        entity={task}
        onImportTaskCreateClick={handleImportTaskCreate}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskCreateClick={handleTaskCreate}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const badgeIcons = screen.getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const newButton = screen.getByTestId('new-icon').closest('button');
    expect(newButton).not.toBeNull();
    if (newButton) {
      fireEvent.click(newButton);
    }

    const newTaskMenu = await screen.findByTestId('new-task-menu');
    expect(newTaskMenu).toHaveTextContent('New Task');
    fireEvent.click(newTaskMenu);
    expect(handleTaskCreate).toHaveBeenCalled();

    if (newButton) {
      fireEvent.click(newButton);
    }
    const newImportTaskMenu = await screen.findByTestId('new-import-task-menu');
    expect(newImportTaskMenu).toHaveTextContent('New Import Task');
    fireEvent.click(newImportTaskMenu);
    expect(handleImportTaskCreate).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);

    const importIcon = screen.getByTestId('import-icon');
    expect(importIcon).toHaveAttribute('title', 'Import Report');
    fireEvent.click(importIcon);
    expect(handleReportImport).toHaveBeenCalledWith(task);

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });
});
