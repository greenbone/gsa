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
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import ScanConfig, {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {entityLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import {
  createGetTaskQueryMock,
  createCloneTaskQueryMock,
  createDeleteTaskQueryMock,
} from 'web/graphql/__mocks__/tasks';

import {createGetScheduleQueryMock} from 'web/graphql/__mocks__/schedules';
import {createGetOverridesQueryMock} from 'web/graphql/__mocks__/overrides';

import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '12345',
  }),
}));

setLocale('en');

const caps = new Capabilities(['everything']);

const reloadInterval = null; // do not reload by default
const manualUrl = 'test/';

// create mock task
const {detailsMockTask: task} = getMockTasks(); // mock task

// mock gmp commands
const config = ScanConfig.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '12345', name: 'foo'},
      {id: '678910', name: 'task2'},
    ],
  },
});

const getConfig = jest.fn().mockResolvedValue({
  data: config,
});

const getEntities = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Task Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
      },
    };

    const id = '12345';
    const [mock, resultFunc] = createGetTaskQueryMock(id);
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, overridesMock, scheduleMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Task: foo');

    const links = screen.getAllByRole('link');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(icons[1]).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');

    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent('Tue, Jul 30, 2019 3:00 PM CEST');
    expect(baseElement).toHaveTextContent('Fri, Aug 30, 2019 3:23 PM CEST');
    expect(baseElement).toHaveTextContent('admin');

    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    const headings = baseElement.querySelectorAll('h2');
    const detailslinks = screen.getAllByTestId('details-link');

    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');

    const progressBars = screen.getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Stopped');
    expect(progressBars[0]).toHaveTextContent('Stopped');
    expect(detailslinks[2]).toHaveAttribute('href', '/report/5678');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailslinks[3]).toHaveAttribute('href', '/target/159');
    expect(baseElement).toHaveTextContent('target 1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailslinks[4]).toHaveAttribute('href', '/alert/151617');
    expect(baseElement).toHaveTextContent('alert 1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailslinks[5]).toHaveAttribute('href', '/scanner/212223');
    expect(baseElement).toHaveTextContent('scanner 1');
    expect(baseElement).toHaveTextContent('OpenVAS Scanner');
    expect(detailslinks[6]).toHaveAttribute('href', '/scanconfig/314');
    expect(baseElement).toHaveTextContent('Order for target hostssequential');
    expect(baseElement).toHaveTextContent('Network Source Interface');
    expect(baseElement).toHaveTextContent(
      'Maximum concurrently executed NVTs per host4',
    );
    expect(baseElement).toHaveTextContent(
      'Maximum concurrently scanned hosts20',
    );

    expect(headings[4]).toHaveTextContent('Assets');
    expect(baseElement).toHaveTextContent('Add to AssetsYes');
    expect(baseElement).toHaveTextContent('Apply OverridesYes');
    expect(baseElement).toHaveTextContent('Min QoD70 %');

    expect(headings[5]).toHaveTextContent('Schedule');
    expect(detailslinks[7]).toHaveAttribute(
      'href',
      '/schedule/c35f82f1-7798-4b84-b2c4-761a33068956',
    );
    expect(baseElement).toHaveTextContent('schedule 1');

    expect(headings[6]).toHaveTextContent('Scan');
    expect(baseElement).toHaveTextContent('2 minutes');
    expect(baseElement).toHaveTextContent(
      'Do not automatically delete reports',
    );
  });

  test('should render user tags tab', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const getTags = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      permissions: {
        get: getEntities,
      },
      tags: {
        get: getTags,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = '12345';
    const [mock, resultFunc] = createGetTaskQueryMock(id);
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, overridesMock, scheduleMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = '12345';
    const [mock, resultFunc] = createGetTaskQueryMock(id);
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, overridesMock, scheduleMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call mutations', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = '12345';
    const [getTaskMock, getTaskResultFunc] = createGetTaskQueryMock(id);
    const [cloneTaskMock, cloneTaskResultFunc] = createCloneTaskQueryMock(id);
    const [deleteTaskMock, deleteTaskResultFunc] = createDeleteTaskQueryMock(
      id,
    );
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        getTaskMock,
        cloneTaskMock,
        deleteTaskMock,
        overridesMock,
        scheduleMock,
      ],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    render(<Detailspage id="12345" />);

    await wait();

    expect(getTaskResultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[3]).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(icons[3]);
    expect(cloneTaskResultFunc).toHaveBeenCalled();

    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(icons[5]);
    expect(deleteTaskResultFunc).toHaveBeenCalled();
  });
});

describe('Task ToolBarIcons tests', () => {
  test('should render', () => {
    const {finishedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons
        entity={finishedTask}
        notes={[{_id: '2021'}, {_id: '2223'}]}
        overrides={[{_id: '2425'}, {_id: '2627'}, {_id: '2829'}]}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    expect(element).toMatchSnapshot();

    const icons = getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(icons[1]).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');
  });

  test('should call click handlers for new task', () => {
    const {newTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={newTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith(newTask);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(newTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(newTask);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(newTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith(newTask);
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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

  test('should call click handlers for running task', () => {
    const {runningTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={runningTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith(runningTask);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(runningTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Task is still in use');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(runningTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(handleTaskStop).toHaveBeenCalledWith(runningTask);
    expect(icons[7]).toHaveAttribute('title', 'Stop');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

    expect(links[2]).toHaveAttribute('href', '/report/5678');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 08/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('2');

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

  test('should call click handlers for stopped task', () => {
    const {stoppedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={stoppedTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith(stoppedTask);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(stoppedTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(stoppedTask);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(stoppedTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith(stoppedTask);
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).toHaveBeenCalledWith(stoppedTask);
    expect(icons[8]).toHaveAttribute('title', 'Resume');

    expect(links[2]).toHaveAttribute('href', '/report/5678');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 08/30/2019',
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

  test('should call click handlers for finished task', () => {
    const {finishedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={finishedTask}
        notes={[{_id: '2021'}, {_id: '2223'}]}
        overrides={[{_id: '2425'}, {_id: '2627'}, {_id: '2829'}]}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith(finishedTask);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(finishedTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(finishedTask);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(finishedTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith(finishedTask);
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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
    expect(badgeIcons[1]).toHaveTextContent('0');

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

  test('should not call click handlers without permission', () => {
    const {observedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={observedTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith(observedTask);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Permission to edit Task denied');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(observedTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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
    const {task: scheduledTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={scheduledTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute(
      'href',
      '/schedule/c35f82f1-7798-4b84-b2c4-761a33068956',
    );
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule 1 (Next due: over)',
    );

    fireEvent.click(icons[9]);
    expect(handleTaskStart).toHaveBeenCalledWith(scheduledTask);
    expect(icons[9]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[10]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[10]).toHaveAttribute('title', 'Task is scheduled');
  });

  test('should call click handlers for container task', () => {
    const {containerTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={containerTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
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
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith(containerTask);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(containerTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(containerTask);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(containerTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleReportImport).toHaveBeenCalledWith(containerTask);
    expect(icons[7]).toHaveAttribute('title', 'Import Report');

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
