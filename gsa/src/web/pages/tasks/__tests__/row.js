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

import {TASK_STATUS} from 'gmp/models/task';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

import Row from '../row';

setLocale('en');

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

describe('Task Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', async () => {
    const {listMockTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    // Name
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );

    expect(taskStatusBar).toHaveAttribute('title', TASK_STATUS.done);
    expect(taskStatusBar).toHaveTextContent(TASK_STATUS.done);

    const lastReportTableData = getByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(lastReportLink).toHaveAttribute('href', '/report/1234');

    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );

    expect(reportsTotalLink).toHaveTextContent('1');
    expect(reportsTotalLink).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(reportsTotalLink).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D12345%20sort-reverse%3Ddate',
    );

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    expect(severityBar).toHaveAttribute('title', 'Medium');
    expect(severityBar).toHaveTextContent('5.0 (Medium)');

    const taskDetailsTableData = getByTestId('task-details');
    const icons = taskDetailsTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    // Observer Icon
    expect(icons[0]).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers john, jane\nRoles admin role, user role\nGroups group 1, group 2',
    );
    expect(icons[0]).toHaveTextContent('provide_view.svg');

    // Trend
    const trendTableData = getByTestId('trend');
    const trendIcon = trendTableData.querySelector("[data-testid='svg-icon']");
    expect(trendIcon).toHaveAttribute('title', 'Severity increased');
    expect(trendIcon).toHaveTextContent('trend_up.svg');

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    expect(actionIcons[0]).toHaveAttribute('title', 'Start');
    expect(actionIcons[1]).toHaveAttribute('title', 'Task is not stopped');
    expect(actionIcons[2]).toHaveAttribute('title', 'Move Task to trashcan');
    expect(actionIcons[3]).toHaveAttribute('title', 'Edit Task');
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should render icons', () => {
    const {task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const taskDetailsTableData = getByTestId('task-details');
    const icons = taskDetailsTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    expect(icons[0]).toHaveAttribute('title', 'Task is alterable');
    expect(icons[1]).toHaveAttribute(
      'title',
      'Task is configured to run on sensor scanner 2',
    );
    expect(icons[2]).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers john, jane\nRoles admin role, user role\nGroups group 1, group 2',
    );
  });

  test('should call click handlers for new task', async () => {
    const {newTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {getByTestId, queryByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const taskDetailsToggle = getByTestId('task-details-toggle');
    fireEvent.click(taskDetailsToggle);

    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '12345');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    expect(taskStatusBar).toHaveAttribute('title', TASK_STATUS.new);
    expect(taskStatusBar).toHaveTextContent(TASK_STATUS.new);

    // Reports
    const lastReportTableData = queryByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).not.toBeInTheDocument();

    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );

    expect(reportsTotalLink).not.toBeInTheDocument();

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    // because there is no severity bar yet
    expect(severityBar).not.toBeInTheDocument();

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    fireEvent.click(actionIcons[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(task);
    expect(actionIcons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(actionIcons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(actionIcons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(actionIcons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(actionIcons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(actionIcons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(actionIcons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(actionIcons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(actionIcons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for running task', async () => {
    const {runningTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const taskDetailsToggle = getByTestId('task-details-toggle');
    fireEvent.click(taskDetailsToggle);

    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '12345');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );

    expect(taskStatusBar).toHaveAttribute('title', TASK_STATUS.running);
    expect(taskStatusBar).toHaveTextContent('0 %');
    const taskStatusDetailsLink = taskStatusBarTableData.querySelector(
      "[data-testid='details-link']",
    );

    expect(taskStatusDetailsLink).toHaveTextContent('0 %');
    expect(taskStatusDetailsLink).toHaveAttribute('href', '/report/5678');

    // Reports
    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );
    expect(reportsTotalLink).toHaveTextContent('2');
    expect(reportsTotalLink).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(reportsTotalLink).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D12345%20sort-reverse%3Ddate',
    );

    // Last Report
    const lastReportTableData = getByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(lastReportLink).toHaveAttribute('href', '/report/1234');

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    expect(severityBar).toHaveAttribute('title', 'Medium');
    expect(severityBar).toHaveTextContent('5.0 (Medium)');

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    fireEvent.click(actionIcons[0]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(actionIcons[0]).toHaveAttribute('title', 'Stop');

    fireEvent.click(actionIcons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(actionIcons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(actionIcons[2]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(actionIcons[2]).toHaveAttribute('title', 'Task is still in use');

    fireEvent.click(actionIcons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(actionIcons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(actionIcons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(actionIcons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
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
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const taskDetailsToggle = getByTestId('task-details-toggle');
    fireEvent.click(taskDetailsToggle);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '12345');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );

    expect(taskStatusBar).toHaveAttribute('title', TASK_STATUS.stopped);
    expect(taskStatusBar).toHaveTextContent(TASK_STATUS.stopped);

    const taskStatusDetailsLink = taskStatusBarTableData.querySelector(
      "[data-testid='details-link']",
    );
    expect(taskStatusDetailsLink).toHaveTextContent('Stopped');
    expect(taskStatusDetailsLink).toHaveAttribute('href', '/report/5678');

    // Reports
    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );
    expect(reportsTotalLink).toHaveTextContent('2');
    expect(reportsTotalLink).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(reportsTotalLink).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D12345%20sort-reverse%3Ddate',
    );

    // Last Report
    const lastReportTableData = getByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(lastReportLink).toHaveAttribute('href', '/report/1234');

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    expect(severityBar).toHaveAttribute('title', 'Medium');
    expect(severityBar).toHaveTextContent('5.0 (Medium)');

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    fireEvent.click(actionIcons[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(task);
    expect(actionIcons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(actionIcons[1]);
    expect(handleTaskResume).toHaveBeenCalledWith(task);
    expect(actionIcons[1]).toHaveAttribute('title', 'Resume');

    fireEvent.click(actionIcons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(actionIcons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(actionIcons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(actionIcons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(actionIcons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(actionIcons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for finished task', () => {
    const {finishedTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const taskDetailsToggle = getByTestId('task-details-toggle');
    fireEvent.click(taskDetailsToggle);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '12345');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );

    expect(taskStatusBar).toHaveAttribute('title', TASK_STATUS.done);
    expect(taskStatusBar).toHaveTextContent(TASK_STATUS.done);

    const taskStatusDetailsLink = taskStatusBarTableData.querySelector(
      "[data-testid='details-link']",
    );
    expect(taskStatusDetailsLink).toHaveTextContent('Done');
    expect(taskStatusDetailsLink).toHaveAttribute('href', '/report/1234');

    // Reports
    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );
    expect(reportsTotalLink).toHaveTextContent('1');
    expect(reportsTotalLink).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(reportsTotalLink).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D12345%20sort-reverse%3Ddate',
    );

    // Last Report
    const lastReportTableData = getByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(lastReportLink).toHaveAttribute('href', '/report/1234');

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    expect(severityBar).toHaveAttribute('title', 'Medium');
    expect(severityBar).toHaveTextContent('5.0 (Medium)');

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    fireEvent.click(actionIcons[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(task);
    expect(actionIcons[0]).toHaveAttribute('title', 'Start');

    fireEvent.click(actionIcons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(actionIcons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(actionIcons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(actionIcons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(actionIcons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(actionIcons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(actionIcons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(actionIcons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should not call click handlers for task without permission', () => {
    const {observedTask: task} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('user'));

    const {getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const taskDetailsToggle = getByTestId('task-details-toggle');
    fireEvent.click(taskDetailsToggle);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '12345');

    const taskDetailsTableData = getByTestId('task-details');
    const icons = taskDetailsTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );
    expect(icons[0]).toHaveAttribute('title', 'Task owned by admin');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );

    expect(taskStatusBar).toHaveAttribute('title', TASK_STATUS.done);
    expect(taskStatusBar).toHaveTextContent(TASK_STATUS.done);

    const taskStatusDetailsLink = taskStatusBarTableData.querySelector(
      "[data-testid='details-link']",
    );
    expect(taskStatusDetailsLink).toHaveTextContent('Done');
    expect(taskStatusDetailsLink).toHaveAttribute('href', '/report/1234');

    // Reports
    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );
    expect(reportsTotalLink).toHaveTextContent('1');
    expect(reportsTotalLink).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(reportsTotalLink).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D12345%20sort-reverse%3Ddate',
    );

    // Last Report
    const lastReportTableData = getByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(lastReportLink).toHaveAttribute('href', '/report/1234');

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    expect(severityBar).toHaveAttribute('title', 'Medium');
    expect(severityBar).toHaveTextContent('5.0 (Medium)');

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    fireEvent.click(actionIcons[0]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(actionIcons[0]).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );

    fireEvent.click(actionIcons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(actionIcons[1]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(actionIcons[2]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(actionIcons[2]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(actionIcons[3]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(actionIcons[3]).toHaveAttribute(
      'title',
      'Permission to edit Task denied',
    );

    fireEvent.click(actionIcons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(actionIcons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
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
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {getByTestId} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const taskDetailsToggle = getByTestId('task-details-toggle');
    fireEvent.click(taskDetailsToggle);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '12345');

    // Status
    const taskStatusBarTableData = getByTestId('task-status');
    const taskStatusBar = taskStatusBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );

    expect(taskStatusBar).toHaveAttribute('title', 'Container');
    expect(taskStatusBar).toHaveTextContent('Container');

    const taskStatusDetailsLink = taskStatusBarTableData.querySelector(
      "[data-testid='details-link']",
    );
    expect(taskStatusDetailsLink).toHaveTextContent('Container');
    expect(taskStatusDetailsLink).toHaveAttribute('href', '/report/1234');

    // Reports
    const reportsTotalTableData = getByTestId('reports-total');
    const reportsTotalLink = reportsTotalTableData.querySelector(
      "[data-testid='reports-total-link']",
    );
    expect(reportsTotalLink).toHaveTextContent('1');
    expect(reportsTotalLink).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(reportsTotalLink).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D12345%20sort-reverse%3Ddate',
    );

    // Last Report
    const lastReportTableData = getByTestId('last-report');
    const lastReportLink = lastReportTableData.querySelector(
      "[data-testid='details-link'",
    );
    expect(lastReportLink).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(lastReportLink).toHaveAttribute('href', '/report/1234');

    // Severity
    const severityBarTableData = getByTestId('severity-bar');
    const severityBar = severityBarTableData.querySelector(
      "[data-testid='progressbar-box']",
    );
    // because container tasks do not have a severity
    expect(severityBar).not.toBeInTheDocument();

    // Actions
    const actionTableData = getByTestId('task-actions');
    const actionIcons = actionTableData.querySelectorAll(
      "[data-testid='svg-icon']",
    );

    fireEvent.click(actionIcons[0]);
    expect(handleReportImport).toHaveBeenCalledWith(task);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(actionIcons[0]).toHaveAttribute('title', 'Import Report');

    fireEvent.click(actionIcons[1]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(actionIcons[1]).toHaveAttribute('title', 'Task is a container');

    fireEvent.click(actionIcons[2]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(actionIcons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(actionIcons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(actionIcons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(actionIcons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(actionIcons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(actionIcons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(actionIcons[5]).toHaveAttribute('title', 'Export Task');
  });

  console.warn = consoleError;
});
