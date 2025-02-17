/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

 
import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Task, {TASK_STATUS} from 'gmp/models/task';
import {rendererWith, fireEvent} from 'web/utils/testing';

import Actions from '../actions';

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_task']);

describe('Task Actions tests', () => {
  // deactivate console.error for tests
  // to make it possible to test actions without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: caps, store: true});
    const {element} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.done,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: caps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(task);
    expect(icons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should not call click handlers without permissions', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.done,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: wrongCaps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Permission to edit Task denied');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Task denied',
    );

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should not call click handlers for stopped task without permissions', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: wrongCaps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute(
      'title',
      'Permission to resume task denied',
    );

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Permission to edit Task denied');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Task denied',
    );

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should not call click handlers for running task without permissions', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: wrongCaps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStop).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'Permission to stop task denied');

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute('title', 'Permission to edit Task denied');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to clone Task denied',
    );

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for running task', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      alterable: '0',
      in_use: true,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: caps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStop).toHaveBeenCalledWith(task);
    expect(icons[0]).toHaveAttribute('title', 'Stop');

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Task is still in use');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for stopped task', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: caps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(task);
    expect(icons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[1]);
    expect(handleTaskResume).toHaveBeenCalledWith(task);
    expect(icons[1]).toHaveAttribute('title', 'Resume');

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should render schedule icon if task is scheduled', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      schedule: {
        _id: 'schedule1',
        name: 'schedule1',
        permissions: {permission: [{name: 'everything'}]},
      },
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
      store: true,
      router: true,
    });
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const detailslinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');

    fireEvent.click(detailslinks[0]);
    expect(detailslinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    fireEvent.click(icons[2]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Start');
    expect(icons[2]).toHaveAttribute('title', 'Task is scheduled');
  });

  test('should call click handlers for container task', () => {
    const task = Task.fromElement({
      permissions: {permission: [{name: 'everything'}]},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const {render} = rendererWith({capabilities: caps, store: true});
    const {getAllByTestId} = render(
      <Actions
        entity={task}
        links={true}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleReportImport).toHaveBeenCalledWith(task);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'Import Report');

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Task is a container');

    fireEvent.click(icons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  console.warn = consoleError;
});
