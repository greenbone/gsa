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
import {MockedProvider} from '@apollo/react-testing';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Task, {TASK_STATUS} from 'gmp/models/task';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Row from '../row';
import {GET_TASK, DELETE_TASK, CLONE_TASK} from 'web/pages/tasks/graphql';

setLocale('en');

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const lastReport = {
  uuid: '1234',
  severity: '5.0',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
};

const currentReport = {
  uuid: '5678',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
};

const mockTask = {
  data: {
    task: {
      name: 'foo',
      uuid: '314',
      creationTime: '2019-07-16T06:31:29Z',
      modificationTime: '2019-07-16T06:44:55Z',
      permissions: [
        {
          name: 'Everything',
        },
      ],
      lastReport,
      reportCount: {
        total: 3,
        finished: 3,
      },
      status: TASK_STATUS.done,
      target: {
        name: 'target1',
        uuid: 'id1',
      },
      trend: 'up',
      comment: 'bar',
      owner: 'username',
      alerts: [
        {
          name: 'alert1',
          uuid: '91011',
        },
      ],
      scanner: {
        uuid: 'id2',
        name: 'scanner1',
        scannerType: 'OPENVAS_SCANNER_TYPE',
      },
      schedulePeriods: null,
      hostsOrdering: null,
      userTags: null,
      observers: {
        users: ['john', 'doe'],
        roles: [
          {
            name: 'r1',
          },
          {
            name: 'r2',
          },
        ],
        groups: [
          {
            name: 'g1',
          },
          {
            name: 'g2',
          },
        ],
      },
    },
  },
};

const mocks = [
  {
    request: {
      query: GET_TASK,
      variables: {taskId: '314'},
    },
    result: mockTask,
  },
  {
    request: {
      query: DELETE_TASK,
      variables: {taskId: '314'},
    },
    result: {
      data: {
        deleteTask: {
          ok: 'true',
        },
      },
    },
  },
  {
    request: {
      query: CLONE_TASK,
      variables: {taskId: '314'},
    },
    result: {
      data: {
        cloneTask: {
          taskId: '314',
        },
      },
    },
  },
];

describe('Task Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', async () => {
    const task = Task.fromObject(mockTask.data.task);

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
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(detailsLinks[1]).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    const icons = getAllByTestId('svg-icon');

    // Observer Icon
    expect(icons[0]).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers john, doe\nRoles r1, r2\nGroups g1, g2',
    );
    expect(icons[0]).toHaveTextContent('provide_view.svg');

    // Trend
    expect(icons[1]).toHaveAttribute('title', 'Severity increased');
    expect(icons[1]).toHaveTextContent('trend_up.svg');

    // Actions

    expect(icons[2]).toHaveAttribute('title', 'Start');
    expect(icons[3]).toHaveAttribute('title', 'Task is not stopped');
    expect(icons[4]).toHaveAttribute('title', 'Move Task to trashcan');
    expect(icons[5]).toHaveAttribute('title', 'Edit Task');
    expect(icons[6]).toHaveAttribute('title', 'Clone Task');
    expect(icons[7]).toHaveAttribute('title', 'Export Task');
  });

  test('should render icons', () => {
    const task = Task.fromObject({
      uuid: '314',
      name: 'foo',
      owner: 'username',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '1',
      reportCount: {
        total: 1,
        finished: 1,
      },
      lastReport,
      permissions: [
        {
          name: 'Everything',
        },
      ],
      target: {
        uuid: 'id',
        name: 'target',
      },
      scanner: {
        uuid: 'id2',
        name: 'scanner',
        scannerType: 'GMP_SCANNER_TYPE',
      },
      observers: {
        users: ['john', 'doe'],
        roles: [
          {
            name: 'r1',
          },
          {
            name: 'r2',
          },
        ],
        groups: [
          {
            name: 'g1',
          },
          {
            name: 'g2',
          },
        ],
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
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Task is alterable');
    expect(icons[1]).toHaveAttribute(
      'title',
      'Task is configured to run on sensor scanner',
    );
    expect(icons[2]).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers john, doe\nRoles r1, r2\nGroups g1, g2',
    );
  });

  test('should call click handlers for new task', async () => {
    const task = Task.fromObject({
      uuid: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.new,
      reportCount: {
        total: 0,
        finished: 0,
      },
      alterable: 0,
      permissions: [
        {
          name: 'Everything',
        },
      ],
      target: {
        uuid: 'id',
        name: 'target',
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

    const {baseElement, getAllByTestId, queryAllByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for running task', async () => {
    const task = Task.fromObject({
      uuid: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      inUse: true,
      status: TASK_STATUS.running,
      reportCount: {
        total: 1,
        finished: 0,
      },
      alterable: 0,
      currentReport,
      permissions: [
        {
          name: 'Everything',
        },
      ],
      target: {
        uuid: 'id',
        name: 'target',
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

    const {baseElement, getAllByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for stopped task', () => {
    const task = Task.fromObject({
      uuid: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.stopped,
      alterable: '0',
      reportCount: {total: 2, finished: 1},
      currentReport,
      lastReport,
      permissions: [{name: 'everything'}],
      target: {uuid: 'id', name: 'target'},
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
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(detailsLinks[1]).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
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
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should call click handlers for finished task', () => {
    const task = Task.fromObject({
      uuid: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      reportCount: {total: 1, finished: 1},
      lastReport,
      permissions: [{name: 'everything'}],
      target: {uuid: 'id', name: 'target'},
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
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(detailsLinks[1]).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
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
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  test('should not call click handlers for task without permission', () => {
    const task = Task.fromObject({
      uuid: '314',
      owner: 'user',
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      reportCount: {total: 1, finished: 1},
      lastReport,
      permissions: [{name: 'get_tasks'}],
      target: {uuid: 'id', name: 'target'},
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
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(detailsLinks[1]).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
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
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[5]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[6]).toHaveAttribute('title', 'Export Task');
  });
  test('should call click handlers for container task', () => {
    const task = Task.fromObject({
      uuid: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      reportCount: {total: 1, finished: 1},
      lastReport,
      permissions: [{name: 'everything'}],
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
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
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
    expect(detailsLinks[1]).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
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
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[2]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[3]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[3]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[4]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '314'});
    expect(icons[4]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Export Task');
  });

  console.warn = consoleError;
});
