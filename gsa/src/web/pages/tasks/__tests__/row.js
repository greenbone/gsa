/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import Task, {TASK_STATUS} from 'gmp/models/task';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Row from '../row';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';

setLocale('en');

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-10T12:51:27Z',
    severity: '5.0',
  },
};

const currentReport = {
  report: {
    _id: '5678',
    timestamp: '2019-07-10T12:51:27Z',
  },
};

describe('Task Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      report_count: {__text: '3', finished: '3'},
      last_report: lastReport,
      trend: 'up',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target'},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
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
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.done);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('3');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Trend
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Severity increased');
    expect(icons[0]).toHaveTextContent('trend_up.svg');

    // Actions

    expect(icons[1]).toHaveAttribute('title', 'Start');
    expect(icons[2]).toHaveAttribute('title', 'Task is not stopped');
    expect(icons[3]).toHaveAttribute('title', 'Move Task to trashcan');
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');
    expect(icons[5]).toHaveAttribute('title', 'Clone Task');
    expect(icons[6]).toHaveAttribute('title', 'Export Task');
  });

  test('should render icons', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '1',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      scanner: {
        _id: 'id',
        name: 'scanner',
        type: GREENBONE_SENSOR_SCANNER_TYPE,
      },
      observers: {
        __text: 'anon nymous',
        role: [{name: 'lorem'}],
        group: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

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
    store.dispatch(setUsername('username'));

    const {getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Task is alterable');
    expect(icons[1]).toHaveAttribute(
      'title',
      'Task is configured to run on sensor scanner',
    );
    expect(icons[2]).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers anon, nymous\nRoles lorem\nGroups ipsum, dolor',
    );
  });

  test('should call click handlers for new task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.new,
      report_count: {__text: '0', finished: '0'},
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId, queryAllByTestId} = render(
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.new);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.new);

    const detailsLinks = queryAllByTestId('details-link');
    expect(detailsLinks.length).toBe(0);
    // because there are no reports yet

    // Actions
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

  test('should call click handlers for running task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      in_use: true,
      status: TASK_STATUS.running,
      alterable: '0',
      report_count: {__text: '1', finished: '0'},
      current_report: currentReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.running);
    expect(bars[0]).toHaveTextContent('0 %');

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('0 %');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks.length).toBe(1);
    // because there is no last report yet

    // Severity
    expect(bars.length).toBe(1);
    // because there is no severity bar yet

    // Actions
    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTaskStart).not.toHaveBeenCalled();
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
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.stopped,
      alterable: '0',
      report_count: {__text: '2', finished: '1'},
      current_report: currentReport,
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.stopped);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.stopped);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Stopped');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('2');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Actions
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

  test('should call click handlers for finished task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.done);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Actions
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

  test('should not call click handlers for task without permission', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'user'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: 'id', name: 'target'},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Task owned by user');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.done);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Actions
    fireEvent.click(icons[1]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );

    fireEvent.click(icons[2]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(icons[3]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Permission to edit Task denied');

    fireEvent.click(icons[5]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[6]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for container task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
    });

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
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', 'Container');
    expect(bars[0]).toHaveTextContent('Container');

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Container');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars.length).toBe(1);
    // because container tasks do not have a severity

    // Actions
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
