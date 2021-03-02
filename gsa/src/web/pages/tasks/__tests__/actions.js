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
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

import Actions from '../actions';

setLocale('en');

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_task']);

describe('Task Actions tests', () => {
  // deactivate console.error for tests
  // to make it possible to test actions without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const {newTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: caps});
    const {baseElement} = render(
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

    expect(baseElement).toMatchSnapshot();
  });

  test('should call click handlers', () => {
    const {finishedTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: caps});

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
    const {observedTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: wrongCaps});

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
    const {stoppedTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
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
    const {runningTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
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
    expect(icons[2]).toHaveAttribute('title', 'Task is still in use');

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
    const {runningTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: caps});

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
    const {stoppedTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: caps});

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
    const {task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

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
      'View Details of Schedule schedule 1 (Next due: over)',
    );

    fireEvent.click(icons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Task is scheduled');
  });

  test('should call click handlers for container task', () => {
    const {containerTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const {render} = rendererWith({capabilities: caps});

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
